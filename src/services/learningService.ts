import type {
  PracticeSession,
  AnswerRecord,
  MistakeEntry,
  LearningProgress,
  Subject,
} from '@/types';
import { storage, storageKeys, generateId } from './storageService';
import { getQuestionById } from '@/data/questions';

function getPracticeSessions(userId: string): PracticeSession[] {
  const all = storage.get<PracticeSession[]>(storageKeys.practiceSessions) ?? [];
  return all.filter((s) => s.userId === userId);
}

function getAllPracticeSessions(): PracticeSession[] {
  return storage.get<PracticeSession[]>(storageKeys.practiceSessions) ?? [];
}

function setAllPracticeSessions(sessions: PracticeSession[]): void {
  storage.set(storageKeys.practiceSessions, sessions);
}

function getAnswers(userId: string): AnswerRecord[] {
  const all = storage.get<AnswerRecord[]>(storageKeys.answers) ?? [];
  return all.filter((a) => a.userId === userId);
}

function getAllAnswers(): AnswerRecord[] {
  return storage.get<AnswerRecord[]>(storageKeys.answers) ?? [];
}

function setAllAnswers(answers: AnswerRecord[]): void {
  storage.set(storageKeys.answers, answers);
}

function getMistakes(userId: string): MistakeEntry[] {
  const all = storage.get<MistakeEntry[]>(storageKeys.mistakes) ?? [];
  return all.filter((m) => m.userId === userId);
}

function getAllMistakes(): MistakeEntry[] {
  return storage.get<MistakeEntry[]>(storageKeys.mistakes) ?? [];
}

function setAllMistakes(mistakes: MistakeEntry[]): void {
  storage.set(storageKeys.mistakes, mistakes);
}

export function createPracticeSession(
  userId: string,
  subject: Subject,
  topic: string,
  questionIds: string[]
): PracticeSession {
  const existing = getAllPracticeSessions();
  const session: PracticeSession = {
    id: generateId('s-'),
    userId,
    subject,
    topic,
    questionIds,
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalQuestions: questionIds.length,
    correctCount: 0,
    incorrectCount: 0,
    skippedCount: 0,
  };
  existing.push(session);
  setAllPracticeSessions(existing);
  return session;
}

export function getAttemptCountForQuestion(userId: string, questionId: string): number {
  const answers = getAnswers(userId);
  return answers.filter((a) => a.questionId === questionId).length;
}

export function recordAnswer(
  userId: string,
  questionId: string,
  selectedOptionIndex: number | null,
  sessionId: string
): AnswerRecord {
  const question = getQuestionById(questionId);
  const isSkipped = selectedOptionIndex === null;
  const isCorrect = !isSkipped && question
    ? selectedOptionIndex === question.correctOptionIndex
    : false;

  const attemptNumber = getAttemptCountForQuestion(userId, questionId) + 1;

  const answer: AnswerRecord = {
    id: generateId('a-'),
    userId,
    questionId,
    selectedOptionIndex,
    isCorrect,
    isSkipped,
    sessionId,
    attemptNumber,
    answeredAt: new Date().toISOString(),
  };

  const all = getAllAnswers();
  all.push(answer);
  setAllAnswers(all);

  if (!isCorrect && !isSkipped) {
    addMistake(userId, questionId, question?.subject ?? 'matematik', question?.topic ?? '');
  }

  return answer;
}

export function completePracticeSession(
  sessionId: string,
  correctCount: number,
  incorrectCount: number,
  skippedCount: number
): void {
  const all = getAllPracticeSessions();
  const idx = all.findIndex((s) => s.id === sessionId);
  if (idx !== -1) {
    all[idx].completedAt = new Date().toISOString();
    all[idx].correctCount = correctCount;
    all[idx].incorrectCount = incorrectCount;
    all[idx].skippedCount = skippedCount;
    setAllPracticeSessions(all);
  }
}

export function addMistake(
  userId: string,
  questionId: string,
  subject: Subject,
  topic: string
): void {
  const all = getAllMistakes();
  const existing = all.find(
    (m) => m.userId === userId && m.questionId === questionId && !m.resolvedAt
  );
  if (existing) {
    existing.reviewCount += 1;
    setAllMistakes(all);
    return;
  }
  const mistake: MistakeEntry = {
    id: generateId('m-'),
    userId,
    questionId,
    subject,
    topic,
    addedAt: new Date().toISOString(),
    reviewed: false,
    reviewCount: 0,
    resolvedAt: null,
  };
  all.push(mistake);
  setAllMistakes(all);
}

export function markMistakeReviewed(mistakeId: string): void {
  const all = getAllMistakes();
  const idx = all.findIndex((m) => m.id === mistakeId);
  if (idx !== -1) {
    all[idx].reviewed = true;
    all[idx].reviewCount += 1;
    setAllMistakes(all);
  }
}

export function resolveMistake(mistakeId: string): void {
  const all = getAllMistakes();
  const idx = all.findIndex((m) => m.id === mistakeId);
  if (idx !== -1) {
    all[idx].resolvedAt = new Date().toISOString();
    setAllMistakes(all);
  }
}

export function getAttemptsForQuestion(userId: string, questionId: string): AnswerRecord[] {
  return getAnswers(userId)
    .filter((a) => a.questionId === questionId)
    .sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
}

export function getRecentSessions(userId: string, limit = 5): PracticeSession[] {
  const sessions = getPracticeSessions(userId);
  return sessions
    .filter((s) => s.completedAt !== null)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
    .slice(0, limit);
}

export function getUnresolvedMistakes(userId: string): MistakeEntry[] {
  return getMistakes(userId)
    .filter((m) => !m.resolvedAt)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export function getResolvedMistakes(userId: string): MistakeEntry[] {
  return getMistakes(userId)
    .filter((m) => m.resolvedAt)
    .sort((a, b) => (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? ''));
}

export function getProgress(userId: string): LearningProgress {
  const answers = getAnswers(userId);
  const sessions = getPracticeSessions(userId);

  const subjectStats: Record<string, { attempts: number; correct: number; incorrect: number; skipped: number }> = {};
  const topicStats: Record<string, { attempts: number; correct: number; incorrect: number; skipped: number }> = {};
  const studyMinutesByDay: Record<string, number> = {};
  const uniqueQuestionIds = new Set<string>();

  for (const answer of answers) {
    const question = getQuestionById(answer.questionId);
    if (!question) continue;

    uniqueQuestionIds.add(answer.questionId);

    const subjectKey = question.subject;
    if (!subjectStats[subjectKey]) subjectStats[subjectKey] = { attempts: 0, correct: 0, incorrect: 0, skipped: 0 };
    subjectStats[subjectKey].attempts += 1;
    if (answer.isSkipped) subjectStats[subjectKey].skipped += 1;
    else if (answer.isCorrect) subjectStats[subjectKey].correct += 1;
    else subjectStats[subjectKey].incorrect += 1;

    const topicKey = `${question.subject}:${question.topic}`;
    if (!topicStats[topicKey]) topicStats[topicKey] = { attempts: 0, correct: 0, incorrect: 0, skipped: 0 };
    topicStats[topicKey].attempts += 1;
    if (answer.isSkipped) topicStats[topicKey].skipped += 1;
    else if (answer.isCorrect) topicStats[topicKey].correct += 1;
    else topicStats[topicKey].incorrect += 1;
  }

  for (const session of sessions) {
    if (!session.completedAt) continue;
    const day = session.completedAt.split('T')[0];
    const minutes = Math.max(1, Math.round(
      (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000
    ));
    studyMinutesByDay[day] = (studyMinutesByDay[day] ?? 0) + minutes;
  }

  const sortedDays = Object.keys(studyMinutesByDay).sort();
  const lastStudyDate = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1] : null;

  return {
    userId,
    totalAttempts: answers.length,
    uniqueQuestionsAttempted: uniqueQuestionIds.size,
    totalCorrect: answers.filter((a) => a.isCorrect).length,
    totalIncorrect: answers.filter((a) => !a.isCorrect && !a.isSkipped).length,
    totalSkipped: answers.filter((a) => a.isSkipped).length,
    subjectStats,
    topicStats,
    studyMinutesByDay,
    lastStudyDate,
  };
}

export function getTopicsNeedingReview(userId: string): { subject: Subject; topic: string; incorrectCount: number }[] {
  const progress = getProgress(userId);
  const topics: { subject: Subject; topic: string; incorrectCount: number }[] = [];

  for (const [key, stats] of Object.entries(progress.topicStats)) {
    if (stats.incorrect > 0) {
      const [subject, topic] = key.split(':');
      topics.push({ subject: subject as Subject, topic, incorrectCount: stats.incorrect });
    }
  }

  return topics.sort((a, b) => b.incorrectCount - a.incorrectCount).slice(0, 5);
}

export function getTodayStudyMinutes(userId: string): number {
  const progress = getProgress(userId);
  const today = new Date().toISOString().split('T')[0];
  return progress.studyMinutesByDay[today] ?? 0;
}

export function hasAnyActivity(userId: string): boolean {
  const answers = getAnswers(userId);
  return answers.length > 0;
}
