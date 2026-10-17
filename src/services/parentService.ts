import type { StudentProfile, Subject, Assignment, ExamEntry } from '@/types';
import { storage, storageKeys, generateId } from './storageService';
import { getProgress, getUnresolvedMistakes, getTopicsNeedingReview } from './learningService';
import { getAssignments, getUpcomingExams } from './studyPlanService';
import { childExtras, announcements, demoParents, type ChildExtra, type DemoExamResult, type Announcement } from '@/data/parentDemo';
import { subjectLabels } from '@/data/programs';
import { getStoredNotesForStudent } from './teacherNotesStore';

const MESSAGES_KEY = 'kubik_parent_messages';

/** Demo velileri (Ayşe ve Zeynep'in velileri) kullanıcı listesine ekler. Her açılışta güvenle çalışır. */
export function seedDemoParents(): void {
  const users = storage.get<Record<string, unknown>[]>(storageKeys.users) ?? [];
  const ids = new Set(users.map((u) => u.id as string));
  let changed = false;
  for (const p of demoParents) {
    if (ids.has(p.id)) continue;
    users.push({
      id: p.id,
      displayName: p.displayName,
      email: p.email,
      educationLevel: 'ortaokul',
      program: 'lgs',
      dailyStudyGoalMinutes: 0,
      createdAt: new Date().toISOString(),
      isDemo: true,
      role: 'parent',
      passwordHash: 'pnskfj', // demo123
    });
    changed = true;
  }
  if (changed) storage.set(storageKeys.users, users);
}

export interface ParentMessage {
  id: string;
  parentId: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  kind: 'message' | 'meeting';
  text: string;
  createdAt: string;
  status: 'sent' | 'read' | 'replied';
  parentName?: string;
  reply?: { text: string; createdAt: string; teacherName: string };
}

export interface ChildOverview {
  student: StudentProfile;
  extra: ChildExtra;
  weeklyMinutes: { day: string; label: string; minutes: number }[];
  weekTotal: number;
  successRate: number | null;
  solvedCount: number;
  openMistakes: number;
  subjectRates: { subject: Subject; label: string; rate: number; attempts: number }[];
  strengths: { label: string; rate: number }[];
  weaknesses: { label: string; incorrect: number }[];
  assignments: Assignment[];
  upcomingExams: ExamEntry[];
  attendanceRate: number;
  attendanceCounts: { present: number; late: number; absent: number; excused: number };
  announcements: Announcement[];
}

type StoredUser = StudentProfile & { passwordHash?: string };

export function getChildrenForParent(parentId: string): StudentProfile[] {
  const users = storage.get<StoredUser[]>(storageKeys.users) ?? [];
  return users
    .filter((u) => (u.role ?? 'student') === 'student' && u.linkedParentId === parentId)
    .map(({ passwordHash: _ph, ...profile }) => {
      void _ph;
      return profile;
    });
}

const dayLabels = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export function getChildOverview(student: StudentProfile): ChildOverview | null {
  const baseExtra = childExtras[student.id];
  if (!baseExtra) return null;
  // Öğretmen panelinden eklenen notlar veli paneline de yansır
  const extra: ChildExtra = { ...baseExtra, notes: [...getStoredNotesForStudent(student.id), ...baseExtra.notes] };

  const progress = getProgress(student.id);

  const weeklyMinutes = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const live = progress.studyMinutesByDay[key] ?? 0;
    return { day: key, label: dayLabels[d.getDay()], minutes: (extra.baseStudyMinutes[i] ?? 0) + live };
  });
  const weekTotal = weeklyMinutes.reduce((s, d) => s + d.minutes, 0);

  const answered = progress.totalCorrect + progress.totalIncorrect;
  const successRate = answered > 0 ? Math.round((progress.totalCorrect / answered) * 100) : null;

  const subjectRates = Object.entries(progress.subjectStats)
    .map(([subject, s]) => {
      const a = s.correct + s.incorrect;
      return {
        subject: subject as Subject,
        label: subjectLabels[subject as Subject] ?? subject,
        rate: a > 0 ? Math.round((s.correct / a) * 100) : 0,
        attempts: s.attempts,
      };
    })
    .sort((a, b) => b.rate - a.rate);

  const strengths = Object.entries(progress.topicStats)
    .map(([key, s]) => {
      const a = s.correct + s.incorrect;
      return { label: key.split(':')[1], rate: a > 0 ? Math.round((s.correct / a) * 100) : 0, a };
    })
    .filter((t) => t.a > 0 && t.rate >= 75)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 4)
    .map(({ label, rate }) => ({ label, rate }));

  const weaknesses = getTopicsNeedingReview(student.id)
    .slice(0, 4)
    .map((t) => ({ label: t.topic, incorrect: t.incorrectCount }));

  const counts = { present: 0, late: 0, absent: 0, excused: 0 };
  for (const a of extra.attendance) counts[a.status] += 1;
  const attendanceRate = Math.round(((counts.present + counts.late) / extra.attendance.length) * 100);

  const audience = student.program === 'yks' || (student.grade ?? 0) >= 9 ? 'yks' : 'lgs';

  return {
    student,
    extra,
    weeklyMinutes,
    weekTotal,
    successRate,
    solvedCount: progress.totalAttempts,
    openMistakes: getUnresolvedMistakes(student.id).length,
    subjectRates,
    strengths,
    weaknesses,
    assignments: getAssignments(student.id),
    upcomingExams: getUpcomingExams(student.id),
    attendanceRate,
    attendanceCounts: counts,
    announcements: announcements
      .filter((n) => n.audience === 'all' || n.audience === audience)
      .sort((a, b) => a.inDays - b.inDays),
  };
}

export function getExamTypes(extra: ChildExtra): DemoExamResult['type'][] {
  return Array.from(new Set(extra.exams.map((e) => e.type)));
}

export function examTotal(e: DemoExamResult): number {
  return Math.round(e.sections.reduce((s, x) => s + x.net, 0) * 100) / 100;
}

export function examMax(e: DemoExamResult): number {
  return e.sections.reduce((s, x) => s + x.max, 0);
}

export function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} dk`;
  return r === 0 ? `${h} sa` : `${h} sa ${r} dk`;
}

/** Şablon tabanlı haftalık veli özeti (AI servisine bağlanınca Gemini ile üretilebilir). */
export function buildWeeklySummary(o: ChildOverview, greeting: string): string[] {
  const first = o.student.displayName.split(' ')[0];
  const lines: string[] = [];
  const goalPct = Math.round((o.weekTotal / o.extra.weeklyGoalMinutes) * 100);
  lines.push(
    `${greeting}, ${first} bu hafta toplam ${formatMinutes(o.weekTotal)} çalıştı (haftalık hedef ${formatMinutes(o.extra.weeklyGoalMinutes)}). ` +
      (goalPct >= 100 ? 'Haftalık hedefini tamamladı. 🎉' : `Hedefe ulaşma oranı %${goalPct}.`),
  );

  const typed = o.extra.exams;
  const last = typed[typed.length - 1];
  const prevSame = [...typed].reverse().find((e) => e.type === last.type && e.id !== last.id);
  if (last && prevSame) {
    const diff = Math.round((examTotal(last) - examTotal(prevSame)) * 100) / 100;
    lines.push(
      `Son ${last.type} denemesinde ${examTotal(last)} net yaptı (${diff >= 0 ? '+' : ''}${diff} net) ve kurum sıralamasında ${last.rankOf} öğrenci arasında ${last.rank}. oldu.`,
    );
  }

  if (o.strengths.length) {
    lines.push(`Güçlü olduğu konu: ${o.strengths[0].label} (%${o.strengths[0].rate} başarı).`);
  }
  if (o.weaknesses.length) {
    lines.push(
      `Desteklenmesi gereken konu: ${o.weaknesses[0].label}. Öğretmeni bu konuyu etüt programına aldı; evde 15 dakikalık kısa tekrarlar çok faydalı olacaktır.`,
    );
  }
  const pending = o.assignments.filter((a) => a.status === 'not_started' || a.status === 'in_progress').length;
  if (pending > 0) lines.push(`Teslim edilmeyi bekleyen ${pending} ödevi var.`);
  if (o.attendanceCounts.absent > 0) {
    lines.push(`Son iki haftada ${o.attendanceCounts.absent} derse katılmadı; devam oranı %${o.attendanceRate}.`);
  } else {
    lines.push(`Devam durumu çok iyi: son iki haftada devamsızlığı yok.`);
  }
  return lines;
}

export function getParentMessages(parentId: string, studentId: string): ParentMessage[] {
  const all = storage.get<ParentMessage[]>(MESSAGES_KEY) ?? [];
  return all
    .filter((m) => m.parentId === parentId && m.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function sendParentMessage(input: Omit<ParentMessage, 'id' | 'createdAt' | 'status'>): ParentMessage {
  const all = storage.get<ParentMessage[]>(MESSAGES_KEY) ?? [];
  const msg: ParentMessage = { ...input, id: generateId('pm-'), createdAt: new Date().toISOString(), status: 'sent' };
  storage.set(MESSAGES_KEY, [...all, msg]);
  return msg;
}
