import type { DemoTeacherNote } from '@/data/parentDemo';
import { storage, generateId } from './storageService';

export const TEACHER_NOTES_KEY = 'kubik_teacher_notes';

export interface StoredTeacherNote {
  id: string;
  studentId: string;
  teacherId: string;
  tone: DemoTeacherNote['tone'];
  text: string;
  createdAt: string;
}

export function getAllStoredNotes(): StoredTeacherNote[] {
  return storage.get<StoredTeacherNote[]>(TEACHER_NOTES_KEY) ?? [];
}

export function addStoredNote(input: Omit<StoredTeacherNote, 'id' | 'createdAt'>): StoredTeacherNote {
  const note: StoredTeacherNote = { ...input, id: generateId('tn-'), createdAt: new Date().toISOString() };
  storage.set(TEACHER_NOTES_KEY, [note, ...getAllStoredNotes()]);
  return note;
}

/** Veli panelinin beklediği formata çevirir (en yeni en üstte). */
export function getStoredNotesForStudent(studentId: string): DemoTeacherNote[] {
  return getAllStoredNotes()
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((n) => ({
      teacherId: n.teacherId,
      tone: n.tone,
      text: n.text,
      daysAgo: Math.max(0, Math.floor((Date.now() - new Date(n.createdAt).getTime()) / 86400000)),
    }));
}
