import type { Question, Subject } from '@/types';
import { sampleQuestions, getQuestionsByTopic } from '@/data/questions';
import { generateId } from './storageService';

export function getAvailableSubjects(program: string): Subject[] {
  const subjects = new Set<Subject>();
  sampleQuestions.forEach((q) => {
    if (q.program === program) {
      subjects.add(q.subject);
    }
  });
  return Array.from(subjects);
}

export function getQuestionsForPractice(subject: Subject, topic: string, count = 5): Question[] {
  const questions = getQuestionsByTopic(subject, topic);
  return questions.slice(0, count);
}

export function getRelatedQuestions(questionId: string): Question[] {
  const question = sampleQuestions.find((q) => q.id === questionId);
  if (!question) return [];
  return sampleQuestions.filter(
    (q) => q.subject === question.subject && q.topic === question.topic && q.id !== questionId
  ).slice(0, 3);
}

export function generateSessionId(): string {
  return generateId('s-');
}

export function generateAnswerId(): string {
  return generateId('a-');
}

export function generateMistakeId(): string {
  return generateId('m-');
}
