import type { Subject, TopicMasteryRecord, MasteryLevel } from '@/types';
import { getProgress } from './learningService';
import { subjectTopics } from '@/data/programs';

const MASTERY_THRESHOLD = 5;
const MASTERY_TARGET_ACCURACY = 70;
const RECENT_WINDOW = 5;

export function getTopicMastery(userId: string): TopicMasteryRecord[] {
  const progress = getProgress(userId);
  const records: TopicMasteryRecord[] = [];

  for (const [key, stats] of Object.entries(progress.topicStats)) {
    const [subject, topic] = key.split(':');
    const answered = stats.correct + stats.incorrect;
    const accuracy = answered > 0 ? Math.round((stats.correct / answered) * 100) : 0;
    const hasEnoughData = answered >= MASTERY_THRESHOLD;

    const recentResults = answersToRecentResults(userId, subject as Subject, topic);
    const recentCorrect = recentResults.filter((r) => r).length;
    const recentAccuracy = recentResults.length > 0
      ? Math.round((recentCorrect / recentResults.length) * 100)
      : accuracy;

    const masteryScore = hasEnoughData ? recentAccuracy : accuracy;
    const masteryLevel = determineMasteryLevel(masteryScore, hasEnoughData, stats.attempts);

    records.push({
      userId,
      subject: subject as Subject,
      topic,
      attempts: stats.attempts,
      correct: stats.correct,
      incorrect: stats.incorrect,
      lastAttemptAt: null,
      recentResults,
      masteryLevel,
      masteryScore,
      hasEnoughData,
    });
  }

  return records.sort((a, b) => b.masteryScore - a.masteryScore);
}

function answersToRecentResults(
  userId: string,
  _subject: Subject,
  _topic: string
): boolean[] {
  const progress = getProgress(userId);
  const key = `${_subject}:${_topic}`;
  const stats = progress.topicStats[key];
  if (!stats || stats.attempts === 0) return [];
  const correctRate = stats.correct / (stats.correct + stats.incorrect || 1);
  const total = Math.min(stats.attempts, RECENT_WINDOW);
  const results: boolean[] = [];
  for (let i = 0; i < total; i++) {
    results.push(i < Math.round(correctRate * total));
  }
  return results;
}

function determineMasteryLevel(
  score: number,
  hasEnoughData: boolean,
  attempts: number
): MasteryLevel {
  if (attempts === 0) return 'not_started';
  if (!hasEnoughData) return 'learning';
  if (score >= MASTERY_TARGET_ACCURACY) return 'mastered';
  if (score < 40) return 'needs_review';
  return 'practicing';
}

export const masteryLevelLabels: Record<MasteryLevel, string> = {
  not_started: 'Başlanmadı',
  learning: 'Öğreniliyor',
  practicing: 'Pratik Ediliyor',
  mastered: 'Öğrenildi',
  needs_review: 'Tekrar Gerekli',
};

export const masteryLevelColors: Record<MasteryLevel, 'neutral' | 'brand' | 'warning' | 'success' | 'error'> = {
  not_started: 'neutral',
  learning: 'brand',
  practicing: 'warning',
  mastered: 'success',
  needs_review: 'error',
};

export function getMasterySummary(userId: string): {
  total: number;
  mastered: number;
  practicing: number;
  learning: number;
  needsReview: number;
} {
  const records = getTopicMastery(userId);
  return {
    total: records.length,
    mastered: records.filter((r) => r.masteryLevel === 'mastered').length,
    practicing: records.filter((r) => r.masteryLevel === 'practicing').length,
    learning: records.filter((r) => r.masteryLevel === 'learning').length,
    needsReview: records.filter((r) => r.masteryLevel === 'needs_review').length,
  };
}

export function getAllTopicsForUser(userId: string): { subject: Subject; topic: string }[] {
  const mastery = getTopicMastery(userId);
  const practicedKeys = new Set(mastery.map((m) => `${m.subject}:${m.topic}`));
  const allTopics = subjectTopics.map((t) => ({ subject: t.subject, topic: t.topic }));
  return allTopics.filter((t) => !practicedKeys.has(`${t.subject}:${t.topic}`));
}
