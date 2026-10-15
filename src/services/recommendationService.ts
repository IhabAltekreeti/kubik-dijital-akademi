import type { AnswerRecord, PracticeSession, Subject, Program } from '@/types';
import { getQuestionById } from '@/data/questions';
import { storage, storageKeys } from './storageService';

export interface Recommendation {
  id: string;
  subject: Subject;
  topic: string;
  reason: string;
  evidence: RecommendationEvidence;
  priority: number;
  actionLabel: string;
  actionLink: string;
}

export interface RecommendationEvidence {
  type: 'low_accuracy' | 'unresolved_mistakes' | 'not_attempted' | 'recent_decline';
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  unresolvedCount: number;
  hasEnoughData: boolean;
  description: string;
}

function getAnswers(userId: string): AnswerRecord[] {
  const all = storage.get<AnswerRecord[]>(storageKeys.answers) ?? [];
  return all.filter((a) => a.userId === userId);
}

function getSessions(userId: string): PracticeSession[] {
  const all = storage.get<PracticeSession[]>(storageKeys.practiceSessions) ?? [];
  return all.filter((s) => s.userId === userId);
}

interface TopicStats {
  subject: Subject;
  topic: string;
  attempts: number;
  correct: number;
  incorrect: number;
  skipped: number;
  recentAccuracy: number;
  recentAttempts: number;
  unresolvedMistakes: number;
  lastAttemptedAt: string | null;
}

function computeTopicStats(userId: string): TopicStats[] {
  const answers = getAnswers(userId);
  const mistakes = storage.get<{ userId: string; questionId: string; resolvedAt: string | null; subject: Subject; topic: string }[]>(
    storageKeys.mistakes
  ) ?? [];

  const statsMap = new Map<string, TopicStats>();

  for (const answer of answers) {
    const question = getQuestionById(answer.questionId);
    if (!question) continue;

    const key = `${question.subject}:${question.topic}`;
    if (!statsMap.has(key)) {
      statsMap.set(key, {
        subject: question.subject,
        topic: question.topic,
        attempts: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        recentAccuracy: 0,
        recentAttempts: 0,
        unresolvedMistakes: 0,
        lastAttemptedAt: null,
      });
    }
    const stats = statsMap.get(key)!;
    stats.attempts += 1;
    if (answer.isSkipped) stats.skipped += 1;
    else if (answer.isCorrect) stats.correct += 1;
    else stats.incorrect += 1;

    if (!stats.lastAttemptedAt || answer.answeredAt > stats.lastAttemptedAt) {
      stats.lastAttemptedAt = answer.answeredAt;
    }
  }

  // Compute recent accuracy (last 5 attempts per topic)
  for (const [key, stats] of statsMap) {
    const topicAnswers = answers
      .filter((a) => {
        const q = getQuestionById(a.questionId);
        return q && `${q.subject}:${q.topic}` === key;
      })
      .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
      .slice(0, 5);
    const recentAnswered = topicAnswers.filter((a) => !a.isSkipped);
    stats.recentAttempts = recentAnswered.length;
    stats.recentAccuracy = recentAnswered.length > 0
      ? Math.round((recentAnswered.filter((a) => a.isCorrect).length / recentAnswered.length) * 100)
      : 0;
  }

  // Count unresolved mistakes per topic
  for (const mistake of mistakes) {
    if (mistake.userId !== userId || mistake.resolvedAt) continue;
    const key = `${mistake.subject}:${mistake.topic}`;
    const stats = statsMap.get(key);
    if (stats) {
      stats.unresolvedMistakes += 1;
    }
  }

  return Array.from(statsMap.values());
}

export function getRecommendations(userId: string, _program: Program): Recommendation[] {
  void _program;
  const topicStats = computeTopicStats(userId);
  const recommendations: Recommendation[] = [];

  // Topics with low recent accuracy (demonstrated difficulty)
  for (const stats of topicStats) {
    const answered = stats.correct + stats.incorrect;
    const overallAccuracy = answered > 0 ? Math.round((stats.correct / answered) * 100) : 0;

    if (stats.recentAttempts >= 3 && stats.recentAccuracy < 60) {
      recommendations.push({
        id: `rec-${stats.subject}-${stats.topic}`,
        subject: stats.subject,
        topic: stats.topic,
        priority: 100 - stats.recentAccuracy,
        actionLabel: 'Bu Konuyu Çalış',
        actionLink: `/app/practice?subject=${stats.subject}&topic=${encodeURIComponent(stats.topic)}`,
        reason: `Son denemelerinde başarı oranın %${stats.recentAccuracy}. Bu konuyu tekrar etmek faydalı olabilir.`,
        evidence: {
          type: 'low_accuracy',
          attempts: stats.attempts,
          correct: stats.correct,
          incorrect: stats.incorrect,
          accuracy: overallAccuracy,
          unresolvedCount: stats.unresolvedMistakes,
          hasEnoughData: stats.recentAttempts >= 3,
          description: `Son ${stats.recentAttempts} denemede ${stats.recentAccuracy}% başarı. Toplam ${stats.attempts} deneme, ${stats.correct} doğru, ${stats.incorrect} yanlış.`,
        },
      });
    } else if (stats.unresolvedMistakes > 0 && answered >= 2) {
      recommendations.push({
        id: `rec-${stats.subject}-${stats.topic}`,
        subject: stats.subject,
        topic: stats.topic,
        priority: 50 + stats.unresolvedMistakes * 10,
        actionLabel: 'Hataları İncele',
        actionLink: '/app/mistakes',
        reason: `Bu konuda ${stats.unresolvedMistakes} incelenmemiş hatan var.`,
        evidence: {
          type: 'unresolved_mistakes',
          attempts: stats.attempts,
          correct: stats.correct,
          incorrect: stats.incorrect,
          accuracy: overallAccuracy,
          unresolvedCount: stats.unresolvedMistakes,
          hasEnoughData: true,
          description: `${stats.unresolvedMistakes} çözülmemiş hata. Toplam ${stats.attempts} deneme, ${overallAccuracy}% başarı.`,
        },
      });
    }
  }

  // Sort by priority
  recommendations.sort((a, b) => b.priority - a.priority);
  return recommendations.slice(0, 4);
}

export function hasInsufficientData(userId: string): boolean {
  const answers = getAnswers(userId);
  return answers.filter((a) => !a.isSkipped).length < 5;
}

export function getStudyHistory(userId: string, limit = 10): PracticeSession[] {
  const sessions = getSessions(userId);
  return sessions
    .filter((s) => s.completedAt !== null)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
    .slice(0, limit);
}

export function getDailyGoalCompletion(userId: string, goalMinutes: number): {
  todayMinutes: number;
  goalMinutes: number;
  percentage: number;
  isComplete: boolean;
} {
  const sessions = getSessions(userId);
  const today = new Date().toISOString().split('T')[0];
  let todayMinutes = 0;
  for (const session of sessions) {
    if (!session.completedAt) continue;
    const day = session.completedAt.split('T')[0];
    if (day !== today) continue;
    const minutes = Math.max(1, Math.round(
      (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000
    ));
    todayMinutes += minutes;
  }
  const percentage = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0;
  return {
    todayMinutes,
    goalMinutes,
    percentage,
    isComplete: todayMinutes >= goalMinutes,
  };
}
