import type { Assignment } from '@/types';
import { storage, storageKeys, generateId } from './storageService';
import { getProgress } from './learningService';
import type { ParentMessage } from './parentService';
import { addStoredNote, getAllStoredNotes, type StoredTeacherNote } from './teacherNotesStore';
import { childExtras, demoParents, type DemoTeacherNote } from '@/data/parentDemo';
import {
  demoTeacher,
  roster,
  seedClassAssignments,
  seedParentMessages,
  teacherClasses,
  weeklySchedule,
  type ClassId,
  type RosterStudent,
  type ScheduleSlot,
  type TeacherClass,
} from '@/data/teacherDemo';

const MESSAGES_KEY = 'kubik_parent_messages';
const CLASS_ASSIGNMENTS_KEY = 'kubik_teacher_class_assignments';
const DEMO_PASSWORD_HASH = 'pnskfj'; // demo123

/* ------------------------------------------------------------------ */
/* seed                                                                */
/* ------------------------------------------------------------------ */

/** Ali Hoca hesabını ve örnek veli mesajlarını ekler. Her açılışta güvenle çalışır. */
export function seedDemoTeacher(): void {
  const users = storage.get<Record<string, unknown>[]>(storageKeys.users) ?? [];
  if (!users.some((u) => u.id === demoTeacher.id || u.email === demoTeacher.email)) {
    users.push({
      id: demoTeacher.id,
      displayName: demoTeacher.displayName,
      email: demoTeacher.email,
      educationLevel: 'lise',
      program: 'yks',
      dailyStudyGoalMinutes: 0,
      createdAt: new Date().toISOString(),
      isDemo: true,
      role: 'teacher',
      passwordHash: DEMO_PASSWORD_HASH,
    });
    storage.set(storageKeys.users, users);
  }

  const messages = storage.get<ParentMessage[]>(MESSAGES_KEY) ?? [];
  const ids = new Set(messages.map((m) => m.id));
  let changed = false;
  for (const s of seedParentMessages) {
    if (ids.has(s.id)) continue;
    messages.push({
      id: s.id,
      parentId: s.parentId,
      parentName: s.parentName,
      studentId: s.studentId,
      teacherId: demoTeacher.staffId,
      teacherName: demoTeacher.displayName,
      kind: s.kind,
      text: s.text,
      createdAt: new Date(Date.now() - s.hoursAgo * 3600000).toISOString(),
      status: s.read ? 'read' : 'sent',
    });
    changed = true;
  }
  if (changed) storage.set(MESSAGES_KEY, messages);
}

/* ------------------------------------------------------------------ */
/* classes & students                                                  */
/* ------------------------------------------------------------------ */

export function getClasses(): TeacherClass[] {
  return teacherClasses;
}

export function getClass(id: string): TeacherClass | undefined {
  return teacherClasses.find((c) => c.id === id);
}

export interface TeacherStudent extends RosterStudent {
  cls: TeacherClass;
  lastNet: number;
  prevNet: number | null;
  netChange: number;
  /** Platformda canlı veri varsa son aktiflik buradan gelir */
  live: boolean;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function enrich(r: RosterStudent): TeacherStudent {
  const cls = getClass(r.classId)!;
  const lastNet = r.nets[r.nets.length - 1];
  const prevNet = r.nets.length > 1 ? r.nets[r.nets.length - 2] : null;
  let lastActive = r.lastActiveDaysAgo;
  let live = false;
  if (r.linkedStudentId) {
    const p = getProgress(r.linkedStudentId);
    if (p.lastStudyDate) {
      const d = Math.floor((Date.now() - new Date(p.lastStudyDate).getTime()) / 86400000);
      lastActive = Math.min(lastActive, Math.max(0, d));
      live = true;
    }
  }
  return {
    ...r,
    cls,
    lastNet,
    prevNet,
    netChange: prevNet === null ? 0 : round2(lastNet - prevNet),
    lastActiveDaysAgo: lastActive,
    live,
  };
}

export function getStudents(classId?: ClassId): TeacherStudent[] {
  return roster.filter((r) => !classId || r.classId === classId).map(enrich);
}

export function getStudent(id: string): TeacherStudent | undefined {
  const r = roster.find((x) => x.id === id);
  return r ? enrich(r) : undefined;
}

export function parentInfoFor(s: RosterStudent): { name: string; relation: string; phone: string } {
  const linked = s.linkedStudentId ? demoParents.find((p) => childExtras[s.linkedStudentId!] && p.displayName === s.parentName) : undefined;
  if (linked) return { name: linked.displayName, relation: linked.relation, phone: linked.phone };
  return { name: s.parentName, relation: 'Veli', phone: '05** *** ** **' };
}

/* ------------------------------------------------------------------ */
/* risk / attention                                                    */
/* ------------------------------------------------------------------ */

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskReason {
  label: string;
  level: RiskLevel;
}

export interface AttentionItem {
  student: TeacherStudent;
  reasons: RiskReason[];
  score: number;
}

const riskWeight: Record<RiskLevel, number> = { high: 3, medium: 2, low: 1 };

export function getRiskReasons(s: TeacherStudent): RiskReason[] {
  const out: RiskReason[] = [];
  if (s.prevNet !== null && s.netChange <= -1) {
    out.push({ label: `Son denemede net düştü (${s.netChange})`, level: s.netChange <= -2 ? 'high' : 'medium' });
  }
  if (s.lastActiveDaysAgo >= 3) {
    out.push({ label: `${s.lastActiveDaysAgo} gündür çalışmadı`, level: s.lastActiveDaysAgo >= 5 ? 'high' : 'medium' });
  }
  const missing = s.homeworkTotal - s.homeworkDone;
  if (missing >= 2) out.push({ label: `${missing} ödev teslim edilmedi`, level: missing >= 3 ? 'high' : 'medium' });
  if (s.attendanceRate < 85) out.push({ label: `Devam %${s.attendanceRate}`, level: s.attendanceRate < 75 ? 'high' : 'medium' });
  const minIdx = s.topicScores.indexOf(Math.min(...s.topicScores));
  if (s.topicScores[minIdx] < 45) out.push({ label: `${s.cls.topics[minIdx]} %${s.topicScores[minIdx]}`, level: 'low' });
  return out;
}

export function getAttentionList(classId?: ClassId): AttentionItem[] {
  return getStudents(classId)
    .map((student) => {
      const reasons = getRiskReasons(student);
      return { student, reasons, score: reasons.reduce((t, r) => t + riskWeight[r.level], 0) };
    })
    .filter((i) => i.score >= 2)
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------------------------------------------ */
/* class stats                                                         */
/* ------------------------------------------------------------------ */

export interface ClassStats {
  cls: TeacherClass;
  studentCount: number;
  avgNets: number[];
  lastAvg: number;
  change: number;
  topicAvgs: { topic: string; avg: number; struggling: number }[];
  attendanceAvg: number;
  homeworkRate: number;
  topStudent: TeacherStudent;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function getClassStats(classId: ClassId): ClassStats {
  const cls = getClass(classId)!;
  const students = getStudents(classId);
  const avgNets = cls.exams.map((_, i) => round2(avg(students.map((s) => s.nets[i]))));
  const lastAvg = avgNets[avgNets.length - 1];
  const change = avgNets.length > 1 ? round2(lastAvg - avgNets[avgNets.length - 2]) : 0;
  const topicAvgs = cls.topics.map((topic, i) => ({
    topic,
    avg: Math.round(avg(students.map((s) => s.topicScores[i]))),
    struggling: students.filter((s) => s.topicScores[i] < 60).length,
  }));
  return {
    cls,
    studentCount: students.length,
    avgNets,
    lastAvg,
    change,
    topicAvgs,
    attendanceAvg: Math.round(avg(students.map((s) => s.attendanceRate))),
    homeworkRate: Math.round((students.reduce((t, s) => t + s.homeworkDone, 0) / students.reduce((t, s) => t + s.homeworkTotal, 0)) * 100),
    topStudent: [...students].sort((a, b) => b.lastNet - a.lastNet)[0],
  };
}

/* ------------------------------------------------------------------ */
/* schedule                                                            */
/* ------------------------------------------------------------------ */

export const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function getSlotsForDay(day: number): ScheduleSlot[] {
  return weeklySchedule.filter((s) => s.day === day).sort((a, b) => a.start.localeCompare(b.start));
}

/** Bugünden başlayarak dersi olan ilk günü döner. */
export function getNextTeachingDay(from = new Date()): { offset: number; day: number; slots: ScheduleSlot[] } {
  for (let offset = 1; offset <= 7; offset++) {
    const day = (from.getDay() + offset) % 7;
    const slots = getSlotsForDay(day);
    if (slots.length) return { offset, day, slots };
  }
  return { offset: 0, day: from.getDay(), slots: [] };
}

export function slotState(slot: ScheduleSlot, now = new Date()): 'past' | 'now' | 'upcoming' {
  const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (hm >= slot.end) return 'past';
  if (hm >= slot.start) return 'now';
  return 'upcoming';
}

/* ------------------------------------------------------------------ */
/* messages                                                            */
/* ------------------------------------------------------------------ */

export interface TeacherMessage extends ParentMessage {
  studentName: string;
  className: string;
}

function allMessages(): ParentMessage[] {
  return storage.get<ParentMessage[]>(MESSAGES_KEY) ?? [];
}

export function getTeacherMessages(): TeacherMessage[] {
  return allMessages()
    .filter((m) => m.teacherId === demoTeacher.staffId)
    .map((m) => {
      const s = roster.find((r) => r.id === m.studentId);
      const parentName = m.parentName ?? demoParents.find((p) => p.id === m.parentId)?.displayName ?? s?.parentName ?? 'Veli';
      return { ...m, parentName, studentName: s?.name ?? 'Öğrenci', className: s ? getClass(s.classId)!.name : '' };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadCount(): number {
  return getTeacherMessages().filter((m) => m.status === 'sent').length;
}

function updateMessage(id: string, patch: Partial<ParentMessage>): void {
  storage.set(
    MESSAGES_KEY,
    allMessages().map((m) => (m.id === id ? { ...m, ...patch } : m)),
  );
}

export function markMessageRead(id: string): void {
  const m = allMessages().find((x) => x.id === id);
  if (m && m.status === 'sent') updateMessage(id, { status: 'read' });
}

export function replyToMessage(id: string, text: string): void {
  updateMessage(id, {
    status: 'replied',
    reply: { text, createdAt: new Date().toISOString(), teacherName: demoTeacher.displayName },
  });
}

/* ------------------------------------------------------------------ */
/* notes                                                               */
/* ------------------------------------------------------------------ */

export interface TeacherNoteView {
  id: string;
  tone: DemoTeacherNote['tone'];
  text: string;
  date: Date;
  isNew: boolean;
}

export function getNotesForStudent(studentId: string): TeacherNoteView[] {
  const stored = getAllStoredNotes()
    .filter((n) => n.studentId === studentId && n.teacherId === demoTeacher.staffId)
    .map((n) => ({ id: n.id, tone: n.tone, text: n.text, date: new Date(n.createdAt), isNew: true }));
  const base = (childExtras[studentId]?.notes ?? [])
    .filter((n) => n.teacherId === demoTeacher.staffId)
    .map((n, i) => {
      const d = new Date();
      d.setDate(d.getDate() - n.daysAgo);
      return { id: `base-${i}`, tone: n.tone, text: n.text, date: d, isNew: false };
    });
  return [...stored, ...base].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function addNoteForStudent(studentId: string, tone: StoredTeacherNote['tone'], text: string): void {
  addStoredNote({ studentId, teacherId: demoTeacher.staffId, tone, text });
}

/* ------------------------------------------------------------------ */
/* class assignments                                                   */
/* ------------------------------------------------------------------ */

export interface ClassAssignment {
  id: string;
  classId: ClassId;
  title: string;
  description: string;
  topic: string;
  mode: 'simple' | 'bank';
  questionIds: string[];
  questionCount: number;
  createdAt: string;
  dueDate: string;
  seedSubmitted?: number;
  seedAvgScore?: number | null;
}

export interface ClassAssignmentView extends ClassAssignment {
  className: string;
  total: number;
  submitted: number;
  avgScore: number | null;
  overdue: boolean;
}

function dateFromNow(days: number, endOfDay = true): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  if (endOfDay) d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

function storedClassAssignments(): ClassAssignment[] {
  return storage.get<ClassAssignment[]>(CLASS_ASSIGNMENTS_KEY) ?? [];
}

export function getClassAssignments(classId?: ClassId): ClassAssignmentView[] {
  const seeds: ClassAssignment[] = seedClassAssignments.map((s) => ({
    id: s.id,
    classId: s.classId,
    title: s.title,
    description: s.description,
    topic: s.topic,
    mode: 'simple',
    questionIds: [],
    questionCount: s.questionCount,
    createdAt: dateFromNow(-s.createdDaysAgo, false),
    dueDate: dateFromNow(s.dueInDays),
    seedSubmitted: s.submitted,
    seedAvgScore: s.avgScore,
  }));
  const studentAssignments = storage.get<Assignment[]>(storageKeys.assignments) ?? [];
  const now = new Date().toISOString();
  return [...storedClassAssignments(), ...seeds]
    .filter((a) => !classId || a.classId === classId)
    .map((a) => {
      const total = roster.filter((r) => r.classId === a.classId).length;
      let submitted = a.seedSubmitted ?? 0;
      let avgScore = a.seedAvgScore ?? null;
      if (a.seedSubmitted === undefined) {
        const linked = studentAssignments.filter((x) => x.classAssignmentId === a.id && (x.status === 'submitted' || x.status === 'graded'));
        submitted = linked.length;
        const scored = linked.filter((x) => x.score !== null);
        avgScore = scored.length ? Math.round(avg(scored.map((x) => x.score!))) : null;
      }
      return { ...a, className: getClass(a.classId)!.name, total, submitted, avgScore, overdue: a.dueDate < now };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface NewClassAssignment {
  classId: ClassId;
  title: string;
  description: string;
  topic: string;
  dueDate: string; // yyyy-mm-dd
  questionIds: string[];
  extraQuestionCount: number;
}

export function createClassAssignment(input: NewClassAssignment): ClassAssignment {
  const cls = getClass(input.classId)!;
  const due = new Date(`${input.dueDate}T23:59:00`).toISOString();
  const ca: ClassAssignment = {
    id: generateId('ca-'),
    classId: input.classId,
    title: input.title,
    description: input.description,
    topic: input.topic,
    mode: input.questionIds.length ? 'bank' : 'simple',
    questionIds: input.questionIds,
    questionCount: input.questionIds.length + input.extraQuestionCount,
    createdAt: new Date().toISOString(),
    dueDate: due,
  };
  storage.set(CLASS_ASSIGNMENTS_KEY, [ca, ...storedClassAssignments()]);

  // Platformda hesabı olan öğrencilere (Ayşe, Mehmet, Zeynep) ödev olarak düşer → öğrenci ve veli panelinde görünür
  const all = storage.get<Assignment[]>(storageKeys.assignments) ?? [];
  const linked = roster.filter((r) => r.classId === input.classId && r.linkedStudentId);
  for (const r of linked) {
    all.push({
      id: generateId('asg-'),
      userId: r.linkedStudentId!,
      title: ca.title,
      description: ca.description,
      subject: cls.subject,
      topic: ca.topic,
      assignedBy: demoTeacher.id,
      assignedByName: demoTeacher.displayName,
      dueDate: due,
      status: 'not_started',
      questionCount: ca.questionCount,
      createdAt: ca.createdAt,
      submittedAt: null,
      score: null,
      maxScore: null,
      questionIds: ca.questionIds.length ? ca.questionIds : undefined,
      classAssignmentId: ca.id,
    });
  }
  storage.set(storageKeys.assignments, all);
  return ca;
}

/** Öğrenci detayında: şubenin ödevleri ve bu öğrencinin durumu. */
export function getAssignmentsForStudent(s: TeacherStudent): { a: ClassAssignmentView; status: 'submitted' | 'pending' | 'late'; score: number | null }[] {
  const studentAssignments = s.linkedStudentId
    ? (storage.get<Assignment[]>(storageKeys.assignments) ?? []).filter((x) => x.userId === s.linkedStudentId)
    : [];
  const ratio = s.homeworkDone / s.homeworkTotal;
  return getClassAssignments(s.classId).map((a, i) => {
    const real = studentAssignments.find((x) => x.classAssignmentId === a.id);
    if (real) {
      const done = real.status === 'submitted' || real.status === 'graded';
      return { a, status: done ? 'submitted' : a.overdue ? 'late' : 'pending', score: real.score };
    }
    if (a.seedSubmitted === undefined) return { a, status: a.overdue ? 'late' : 'pending', score: null };
    // demo: ödev teslim oranına göre tutarlı bir durum üret
    const hash = [...(s.id + a.id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7);
    const done = (hash % 100) / 100 < ratio || (i === 0 && ratio >= 0.8);
    const score = done && a.seedAvgScore ? Math.max(30, Math.min(100, Math.round(a.seedAvgScore + (s.topicScores[0] - 70) / 2))) : null;
    return { a, status: done ? 'submitted' : a.overdue ? 'late' : 'pending', score };
  });
}

/** Öğrencinin platformda tamamladığı ödevi işaretler (Pratik sayfasından çağrılır). */
export function submitStudentAssignment(assignmentId: string, correct: number, total: number): void {
  const all = storage.get<Assignment[]>(storageKeys.assignments) ?? [];
  storage.set(
    storageKeys.assignments,
    all.map((a) =>
      a.id === assignmentId
        ? { ...a, status: 'graded' as const, submittedAt: new Date().toISOString(), score: total ? Math.round((correct / total) * 100) : 0, maxScore: 100 }
        : a,
    ),
  );
}
