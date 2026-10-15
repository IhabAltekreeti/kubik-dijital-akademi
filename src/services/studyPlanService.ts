import type { StudyTask, Assignment, ExamEntry, TaskChangeRequest, Subject } from '@/types';
import { storage, storageKeys, generateId } from './storageService';

function getAllTasks(): StudyTask[] {
  return storage.get<StudyTask[]>(storageKeys.studyTasks) ?? [];
}

function setAllTasks(tasks: StudyTask[]): void {
  storage.set(storageKeys.studyTasks, tasks);
}

function getAllAssignments(): Assignment[] {
  return storage.get<Assignment[]>(storageKeys.assignments) ?? [];
}

function getAllExams(): ExamEntry[] {
  return storage.get<ExamEntry[]>(storageKeys.exams) ?? [];
}

function getAllChangeRequests(): TaskChangeRequest[] {
  return storage.get<TaskChangeRequest[]>(storageKeys.taskChangeRequests) ?? [];
}

function setAllChangeRequests(requests: TaskChangeRequest[]): void {
  storage.set(storageKeys.taskChangeRequests, requests);
}

// Study tasks

export function getTasks(userId: string): StudyTask[] {
  return getAllTasks()
    .filter((t) => t.userId === userId)
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const aDue = a.dueDate ?? '9999';
      const bDue = b.dueDate ?? '9999';
      return aDue.localeCompare(bDue);
    });
}

export function getTodaysTasks(userId: string): StudyTask[] {
  const today = new Date().toISOString().split('T')[0];
  return getTasks(userId).filter((t) => {
    if (t.status === 'completed') return false;
    if (t.dueDate === null) return true;
    const dueDay = t.dueDate.split('T')[0];
    return dueDay <= today;
  });
}

export function getPendingTasks(userId: string): StudyTask[] {
  return getTasks(userId).filter((t) => t.status !== 'completed');
}

export function getCompletedTasks(userId: string): StudyTask[] {
  return getTasks(userId).filter((t) => t.status === 'completed');
}

export function createPersonalTask(
  userId: string,
  data: { title: string; description: string; subject?: Subject; topic?: string; estimatedMinutes: number; dueDate: string | null; type?: StudyTask['type'] }
): StudyTask {
  const task: StudyTask = {
    id: generateId('task-'),
    userId,
    title: data.title,
    description: data.description,
    origin: 'student',
    type: data.type ?? 'practice',
    subject: data.subject,
    topic: data.topic,
    estimatedMinutes: data.estimatedMinutes,
    dueDate: data.dueDate,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  const all = getAllTasks();
  all.push(task);
  setAllTasks(all);
  return task;
}

export function completeTask(taskId: string): void {
  const all = getAllTasks();
  const idx = all.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    all[idx].status = 'completed';
    all[idx].completedAt = new Date().toISOString();
    setAllTasks(all);
  }
}

export function uncompleteTask(taskId: string): void {
  const all = getAllTasks();
  const idx = all.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    all[idx].status = 'pending';
    all[idx].completedAt = null;
    setAllTasks(all);
  }
}

export function deleteTask(taskId: string, userId: string): boolean {
  const all = getAllTasks();
  const task = all.find((t) => t.id === taskId);
  if (!task || task.userId !== userId || task.origin !== 'student') {
    return false;
  }
  setAllTasks(all.filter((t) => t.id !== taskId));
  return true;
}

export function canModifyTask(task: StudyTask): boolean {
  return task.origin === 'student';
}

// Change requests for teacher/counselor tasks

export function createChangeRequest(
  taskId: string,
  userId: string,
  requestType: TaskChangeRequest['requestType'],
  reason: string
): TaskChangeRequest {
  const request: TaskChangeRequest = {
    id: generateId('cr-'),
    taskId,
    userId,
    requestType,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
  };
  const all = getAllChangeRequests();
  all.push(request);
  setAllChangeRequests(all);
  return request;
}

export function getChangeRequestsForUser(userId: string): TaskChangeRequest[] {
  return getAllChangeRequests()
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function hasPendingChangeRequest(userId: string, taskId: string): boolean {
  return getAllChangeRequests().some(
    (r) => r.userId === userId && r.taskId === taskId && r.status === 'pending'
  );
}

// Assignments

export function getAssignments(userId: string): Assignment[] {
  return getAllAssignments()
    .filter((a) => a.userId === userId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getPendingAssignments(userId: string): Assignment[] {
  return getAssignments(userId).filter(
    (a) => a.status === 'not_started' || a.status === 'in_progress'
  );
}

export function getCompletedAssignments(userId: string): Assignment[] {
  return getAssignments(userId).filter(
    (a) => a.status === 'submitted' || a.status === 'graded'
  );
}

// Exams

export function getUpcomingExams(userId: string): ExamEntry[] {
  const today = new Date().toISOString().split('T')[0];
  return getAllExams()
    .filter((e) => e.userId === userId && e.status === 'upcoming' && e.examDate.split('T')[0] >= today)
    .sort((a, b) => a.examDate.localeCompare(b.examDate));
}

export function getAllExamsForUser(userId: string): ExamEntry[] {
  return getAllExams()
    .filter((e) => e.userId === userId)
    .sort((a, b) => a.examDate.localeCompare(b.examDate));
}
