import type { Assignment } from '@/types';
import { storage, storageKeys, generateId } from './storageService';
import { callEdgeFunction } from './geminiService';
import { getAttentionList, getClassStats, getClassAssignments, getTeacherMessages, getUnreadCount } from './teacherService';
import { getAllStoredNotes } from './teacherNotesStore';
import { getAdminAnnouncements, type AdminAudience } from './announcementStore';
import { roster } from '@/data/teacherDemo';
import {
  absentToday,
  adminTeachers,
  annualFees,
  branches,
  collectionRates,
  counselingStats,
  demoAdmin,
  installmentCount,
  institution,
  lastYearCollectionRates,
  leadStages,
  levelLabels,
  metricInfo,
  months,
  overdueFamilies,
  overdueFamilyCount,
  scoring,
  seedActivity,
  seedLeads,
  seedRiskStudents,
  todayExpected,
  turkeyAverages,
  type AdminTeacher,
  type Branch,
  type LeadStage,
  type Level,
  type OverdueFamily,
} from '@/data/adminDemo';

const LEADS_KEY = 'kubik_admin_leads';
const REMINDERS_KEY = 'kubik_admin_payment_reminders';
const DEMO_PASSWORD_HASH = 'pnskfj'; // demo123

const round1 = (n: number) => Math.round(n * 10) / 10;

export const tl = (n: number) => `₺${Math.round(n).toLocaleString('tr-TR')}`;
export const num = (n: number, d = 1) => n.toLocaleString('tr-TR', { maximumFractionDigits: d, minimumFractionDigits: 0 });

/* ------------------------------------------------------------------ */
/* seed                                                                */
/* ------------------------------------------------------------------ */

/** Yönetim demo hesabını ekler (yonetim@kubik.com / demo123). */
export function seedDemoAdmin(): void {
  const users = storage.get<Record<string, unknown>[]>(storageKeys.users) ?? [];
  if (users.some((u) => u.id === demoAdmin.id || u.email === demoAdmin.email)) return;
  users.push({
    id: demoAdmin.id,
    displayName: demoAdmin.displayName,
    email: demoAdmin.email,
    educationLevel: 'lise',
    program: 'yks',
    dailyStudyGoalMinutes: 0,
    createdAt: new Date().toISOString(),
    isDemo: true,
    role: 'admin',
    passwordHash: DEMO_PASSWORD_HASH,
  });
  storage.set(storageKeys.users, users);
}

/* ------------------------------------------------------------------ */
/* şubeler (Ali Hoca'nın şubeleri canlı)                               */
/* ------------------------------------------------------------------ */

export interface BranchRow extends Branch {
  change: number;
  live: boolean;
  turkeyAvg: number | null;
}

export function getBranchRows(): BranchRow[] {
  return branches.map((b) => {
    let attendance = b.attendance;
    let homework = b.homework;
    if (b.liveFromTeacher) {
      const st = getClassStats(b.liveFromTeacher);
      attendance = st.attendanceAvg;
      homework = st.homeworkRate;
    }
    const tr = turkeyAverages.find((t) => t.metric === b.metric);
    return { ...b, attendance, homework, change: round1(b.last - b.prev), live: !!b.liveFromTeacher, turkeyAvg: tr ? tr.avg : null };
  });
}

export interface LevelSummary {
  level: Level;
  label: string;
  students: number;
  branches: number;
  metric: Branch['metric'];
  avgLast: number;
  avgPrev: number;
  turkeyAvg: number | null;
  turkeyExam: string | null;
  max: number;
}

function weighted(rows: BranchRow[], key: 'last' | 'prev' | 'attendance' | 'homework'): number {
  const total = rows.reduce((t, r) => t + r.students, 0);
  return total ? round1(rows.reduce((t, r) => t + r[key] * r.students, 0) / total) : 0;
}

export function getLevelSummaries(): LevelSummary[] {
  const rows = getBranchRows();
  return (Object.keys(levelLabels) as Level[]).map((level) => {
    const rs = rows.filter((r) => r.level === level);
    const metric = rs[0].metric;
    const tr = turkeyAverages.find((t) => t.metric === metric);
    return {
      level,
      label: levelLabels[level],
      students: rs.reduce((t, r) => t + r.students, 0),
      branches: rs.length,
      metric,
      avgLast: weighted(rs, 'last'),
      avgPrev: weighted(rs, 'prev'),
      turkeyAvg: tr?.avg ?? null,
      turkeyExam: tr?.exam ?? null,
      max: metricInfo[metric].max,
    };
  });
}

/* ------------------------------------------------------------------ */
/* ön kayıt                                                            */
/* ------------------------------------------------------------------ */

export interface Lead {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  grade: string;
  source: string;
  createdAt: string;
  stage: LeadStage;
  note: string;
  /** Seed'deki kayıtlar zaten 206 öğrencinin içinde */
  countedInBase: boolean;
  updatedAt: string;
}

function seedLeadList(): Lead[] {
  return seedLeads.map((s) => {
    const d = new Date(Date.now() - s.daysAgo * 86400000).toISOString();
    return { id: s.id, studentName: s.studentName, parentName: s.parentName, phone: s.phone, grade: s.grade, source: s.source, createdAt: d, updatedAt: d, stage: s.stage, note: s.note, countedInBase: s.stage === 'kayit' };
  });
}

export function getLeads(): Lead[] {
  let leads = storage.get<Lead[]>(LEADS_KEY);
  if (!leads) {
    leads = seedLeadList();
    storage.set(LEADS_KEY, leads);
  }
  return [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addLead(input: Pick<Lead, 'studentName' | 'parentName' | 'phone' | 'grade' | 'source' | 'note'>): Lead {
  const now = new Date().toISOString();
  const lead: Lead = { ...input, id: generateId('lead-'), createdAt: now, updatedAt: now, stage: 'yeni', countedInBase: false };
  storage.set(LEADS_KEY, [lead, ...getLeads()]);
  return lead;
}

export function updateLeadStage(id: string, stage: LeadStage): void {
  storage.set(
    LEADS_KEY,
    getLeads().map((l) => (l.id === id ? { ...l, stage, updatedAt: new Date().toISOString() } : l)),
  );
}

export function resetLeads(): void {
  storage.set(LEADS_KEY, seedLeadList());
}

export function newLeadCount(): number {
  return getLeads().filter((l) => l.stage === 'yeni').length;
}

export interface LeadFunnel {
  stages: { id: LeadStage; label: string; count: number }[];
  active: number;
  converted: number;
  lost: number;
  conversionRate: number;
  bySource: { source: string; total: number; converted: number }[];
}

export function getLeadFunnel(): LeadFunnel {
  const leads = getLeads();
  const stages = leadStages.map((s) => ({ ...s, count: leads.filter((l) => l.stage === s.id).length }));
  const converted = leads.filter((l) => l.stage === 'kayit').length;
  const lost = leads.filter((l) => l.stage === 'kayip').length;
  const closed = converted + lost;
  const sources = Array.from(new Set(leads.map((l) => l.source)));
  return {
    stages,
    active: leads.length - closed,
    converted,
    lost,
    conversionRate: closed ? Math.round((converted / closed) * 100) : 0,
    bySource: sources
      .map((source) => ({ source, total: leads.filter((l) => l.source === source).length, converted: leads.filter((l) => l.source === source && l.stage === 'kayit').length }))
      .sort((a, b) => b.total - a.total),
  };
}

/* ------------------------------------------------------------------ */
/* genel bakış                                                         */
/* ------------------------------------------------------------------ */

const baseStudents = branches.reduce((t, b) => t + b.students, 0);

export function totalStudents(): number {
  return baseStudents + getLeads().filter((l) => l.stage === 'kayit' && !l.countedInBase).length;
}

export interface Overview {
  students: number;
  capacity: number;
  target: number;
  lastYear: number;
  occupancy: number;
  growthPct: number;
  toTarget: number;
  todayExpected: number;
  todayPresent: number;
  todayAbsent: number;
  monthName: string;
  monthRate: number;
  monthCollected: number;
  monthExpected: number;
  activeLeads: number;
  newLeads: number;
  riskCount: number;
  highRiskCount: number;
}

export function getOverview(): Overview {
  const students = totalStudents();
  const fin = getFinance();
  const risk = getRiskRows();
  const funnel = getLeadFunnel();
  const absent = absentToday.filter((a) => a.status !== 'gec').length;
  const cur = fin.months[fin.currentIndex];
  return {
    students,
    capacity: institution.capacity,
    target: institution.enrollmentTarget,
    lastYear: institution.lastYearStudents,
    occupancy: Math.round((students / institution.capacity) * 100),
    growthPct: round1(((students - institution.lastYearStudents) / institution.lastYearStudents) * 100),
    toTarget: Math.max(0, institution.enrollmentTarget - students),
    todayExpected,
    todayPresent: todayExpected - absent,
    todayAbsent: absent,
    monthName: cur.name,
    monthRate: cur.rate ?? 0,
    monthCollected: cur.collected,
    monthExpected: cur.expected,
    activeLeads: funnel.active,
    newLeads: funnel.stages.find((s) => s.id === 'yeni')?.count ?? 0,
    riskCount: risk.length,
    highRiskCount: risk.filter((r) => r.level === 'high').length,
  };
}

/* ------------------------------------------------------------------ */
/* öğretmen performansı                                                */
/* ------------------------------------------------------------------ */

export interface TeacherRow extends AdminTeacher {
  scores: { net: number; satisfaction: number; homework: number; attendance: number; reply: number };
  composite: number;
  rank: number;
  pendingMessages: number;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

/** Ali Hoca'nın net/ödev/devam verisi öğretmen panelinden canlı hesaplanır. */
function liveAli(t: AdminTeacher): AdminTeacher {
  const stats = (['8-A', '12-B'] as const).map((id) => getClassStats(id));
  const total = stats.reduce((s, x) => s + x.studentCount, 0);
  const w = (f: (x: (typeof stats)[number]) => number) => stats.reduce((s, x) => s + f(x) * x.studentCount, 0) / total;
  const netGainPct = round1(w((x) => ((x.lastAvg - x.avgNets[0]) / x.cls.netMax) * 100));
  return { ...t, netGainPct, homeworkRate: Math.round(w((x) => x.homeworkRate)), attendanceRate: Math.round(w((x) => x.attendanceAvg)) };
}

export function getTeacherRows(): TeacherRow[] {
  const { weights, netPointsPerPct, replyBestHours, replyWorstHours } = scoring;
  const rows = adminTeachers
    .filter((t) => !t.counselor)
    .map((raw) => {
      const t = raw.live ? liveAli(raw) : raw;
      const scores = {
        net: Math.round(clamp(t.netGainPct * netPointsPerPct)),
        satisfaction: Math.round(clamp((t.satisfaction / 5) * 100)),
        homework: Math.round(clamp(t.homeworkRate)),
        attendance: Math.round(clamp(t.attendanceRate)),
        reply: Math.round(clamp(100 - ((t.replyHours - replyBestHours) / (replyWorstHours - replyBestHours)) * 100)),
      };
      const composite = round1(
        scores.net * weights.net +
          scores.satisfaction * weights.satisfaction +
          scores.homework * weights.homework +
          scores.attendance * weights.attendance +
          scores.reply * weights.reply,
      );
      return { ...t, scores, composite, rank: 0, pendingMessages: t.live ? getUnreadCount() : 0 };
    })
    .sort((a, b) => b.composite - a.composite);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

export function getCounselor() {
  return { teacher: adminTeachers.find((t) => t.counselor)!, stats: counselingStats };
}

/* ------------------------------------------------------------------ */
/* finans                                                              */
/* ------------------------------------------------------------------ */

export interface FinanceMonth {
  name: string;
  expected: number;
  collected: number;
  rate: number | null;
  lastYearRate: number | null;
  state: 'past' | 'current' | 'future';
}

export interface OverdueRow extends OverdueFamily {
  amount: number;
  reminded: boolean;
}

export interface Finance {
  feeRows: { level: Level; label: string; students: number; fee: number; installment: number; total: number }[];
  annualTotal: number;
  monthlyExpected: number;
  months: FinanceMonth[];
  currentIndex: number;
  collectedToDate: number;
  expectedToDate: number;
  overdueTotal: number;
  overdueFamilyCount: number;
  remainingTotal: number;
  overdue: OverdueRow[];
}

export function getFinance(): Finance {
  const rows = getBranchRows();
  const feeRows = (Object.keys(levelLabels) as Level[]).map((level) => {
    const students = rows.filter((r) => r.level === level).reduce((t, r) => t + r.students, 0);
    return { level, label: levelLabels[level], students, fee: annualFees[level], installment: annualFees[level] / installmentCount, total: students * annualFees[level] };
  });
  const annualTotal = feeRows.reduce((t, r) => t + r.total, 0);
  const monthlyExpected = annualTotal / installmentCount;
  const currentIndex = collectionRates.length - 1;
  const fm: FinanceMonth[] = months.map((name, i) => {
    const rate = collectionRates[i] ?? null;
    return {
      name,
      expected: monthlyExpected,
      collected: rate === null ? 0 : (monthlyExpected * rate) / 100,
      rate,
      lastYearRate: lastYearCollectionRates[i] ?? null,
      state: i < currentIndex ? 'past' : i === currentIndex ? 'current' : 'future',
    };
  });
  const past = fm.filter((m) => m.rate !== null);
  const collectedToDate = past.reduce((t, m) => t + m.collected, 0);
  const expectedToDate = past.reduce((t, m) => t + m.expected, 0);
  const reminded = new Set(storage.get<string[]>(REMINDERS_KEY) ?? []);
  return {
    feeRows,
    annualTotal,
    monthlyExpected,
    months: fm,
    currentIndex,
    collectedToDate,
    expectedToDate,
    overdueTotal: expectedToDate - collectedToDate,
    overdueFamilyCount,
    remainingTotal: annualTotal - collectedToDate,
    overdue: overdueFamilies
      .map((o) => ({ ...o, amount: o.installments * (annualFees[o.level] / installmentCount), reminded: reminded.has(o.id) }))
      .sort((a, b) => b.daysLate - a.daysLate || b.amount - a.amount),
  };
}

export function markReminded(ids: string[]): void {
  const cur = new Set(storage.get<string[]>(REMINDERS_KEY) ?? []);
  ids.forEach((id) => cur.add(id));
  storage.set(REMINDERS_KEY, Array.from(cur));
}

/* ------------------------------------------------------------------ */
/* risk                                                                */
/* ------------------------------------------------------------------ */

export interface RiskRow {
  name: string;
  className: string;
  level: 'high' | 'medium';
  reasons: string[];
  owner: string;
  live: boolean;
  studentId?: string;
}

export function getRiskRows(): RiskRow[] {
  const live: RiskRow[] = getAttentionList().map((a) => ({
    name: a.student.name,
    className: a.student.cls.name,
    level: a.score >= 6 ? 'high' : 'medium',
    reasons: a.reasons.map((r) => r.label),
    owner: 'Ali Hoca',
    live: true,
    studentId: a.student.id,
  }));
  const seeds: RiskRow[] = seedRiskStudents.map((s) => ({ ...s, live: false }));
  return [...live, ...seeds].sort((a, b) => (a.level === b.level ? b.reasons.length - a.reasons.length : a.level === 'high' ? -1 : 1));
}

export function getAbsentToday() {
  return absentToday;
}

/* ------------------------------------------------------------------ */
/* canlı akış                                                          */
/* ------------------------------------------------------------------ */

export type ActivityKind = 'payment' | 'assignment' | 'attendance' | 'exam' | 'counseling' | 'message' | 'note' | 'lead' | 'announcement' | 'submission';

export interface ActivityItem {
  id: string;
  at: string;
  kind: ActivityKind;
  text: string;
  live: boolean;
}

const seedLeadIds = new Set(seedLeads.map((s) => s.id));

export function getActivity(limit = 12): ActivityItem[] {
  const out: ActivityItem[] = [];
  const nameOf = (id: string) => roster.find((r) => r.id === id)?.name ?? 'öğrenci';

  for (const m of getTeacherMessages()) {
    if (m.reply) out.push({ id: `rep-${m.id}`, at: m.reply.createdAt, kind: 'message', text: `Ali Hoca, ${m.parentName}'ın mesajını cevapladı (${m.studentName})`, live: true });
  }
  for (const n of getAllStoredNotes()) {
    out.push({ id: `note-${n.id}`, at: n.createdAt, kind: 'note', text: `Ali Hoca, ${nameOf(n.studentId)} için veliye not yazdı`, live: true });
  }
  for (const a of getClassAssignments()) {
    if (a.seedSubmitted === undefined) out.push({ id: `ca-${a.id}`, at: a.createdAt, kind: 'assignment', text: `Ali Hoca, ${a.className} şubesine "${a.title}" ödevini verdi`, live: true });
  }
  const studentAssignments = storage.get<Assignment[]>(storageKeys.assignments) ?? [];
  for (const s of studentAssignments) {
    if (s.classAssignmentId && s.submittedAt && (s.status === 'graded' || s.status === 'submitted')) {
      out.push({ id: `sub-${s.id}`, at: s.submittedAt, kind: 'submission', text: `${nameOf(s.userId)} "${s.title}" ödevini tamamladı${s.score !== null ? ` — %${s.score}` : ''}`, live: true });
    }
  }
  for (const l of getLeads()) {
    if (!seedLeadIds.has(l.id)) out.push({ id: `lead-${l.id}`, at: l.createdAt, kind: 'lead', text: `Yeni ön kayıt: ${l.studentName} (${l.grade}) — ${l.source}`, live: true });
    if (l.stage === 'kayit' && !l.countedInBase) out.push({ id: `enr-${l.id}`, at: l.updatedAt, kind: 'lead', text: `Kayıt tamamlandı: ${l.studentName} (${l.grade})`, live: true });
  }
  for (const a of getAdminAnnouncements()) {
    out.push({ id: `ann-${a.id}`, at: a.createdAt, kind: 'announcement', text: `Duyuru gönderildi: "${a.title}" — ${a.recipients} veli${a.sms ? ' (uygulama + SMS)' : ''}`, live: true });
  }
  seedActivity.forEach((s, i) => out.push({ id: `seed-${i}`, at: new Date(Date.now() - s.minutesAgo * 60000).toISOString(), kind: s.kind, text: s.text, live: false }));
  return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* duyuru alıcıları                                                    */
/* ------------------------------------------------------------------ */

export function recipientCount(audience: AdminAudience): number {
  if (audience === 'all') return totalStudents();
  return branches.filter((b) => b.level === audience).reduce((t, b) => t + b.students, 0);
}

/** Türkçe karakterli SMS: 1 SMS = 155 karakter (operatöre göre değişebilir) */
export function smsSegments(text: string): number {
  return Math.max(1, Math.ceil(text.length / 155));
}

/* ------------------------------------------------------------------ */
/* Kübik AI haftalık yönetim raporu                                    */
/* ------------------------------------------------------------------ */

export interface AdminAIResult {
  text: string;
  source: 'gemini' | 'local';
}

export function adminContextText(): string {
  const o = getOverview();
  const f = getFinance();
  const lv = getLevelSummaries();
  const br = getBranchRows();
  const t = getTeacherRows();
  const risk = getRiskRows();
  const funnel = getLeadFunnel();
  const netBr = br.filter((b) => b.metric !== 'KAZANIM');
  const up = [...netBr].sort((a, b) => b.change - a.change)[0];
  const down = [...netBr].sort((a, b) => a.change - b.change)[0];
  return [
    `Kurum: ${institution.name}, dönem ${institution.term}`,
    `Öğrenci: ${o.students} (kapasite ${o.capacity}, hedef ${o.target}, geçen yıl ${o.lastYear}, büyüme %${num(o.growthPct)})`,
    `Bugün devam: ${o.todayPresent}/${o.todayExpected}, habersiz/izinli devamsız ${o.todayAbsent}`,
    `Seviye ortalamaları: ${lv.map((l) => `${l.label} ${num(l.avgLast)} (önceki ${num(l.avgPrev)}${l.turkeyAvg ? `, Türkiye ${num(l.turkeyAvg)}` : ''})`).join('; ')}`,
    `En çok yükselen şube ${up.name} (${up.change > 0 ? '+' : ''}${num(up.change)}), en çok düşen şube ${down.name} (${num(down.change)})`,
    `Finans: yıllık sözleşme ${tl(f.annualTotal)}, ${o.monthName} tahsilatı %${o.monthRate} (${tl(o.monthCollected)} / ${tl(o.monthExpected)}), geciken toplam ${tl(f.overdueTotal)}, ${f.overdueFamilyCount} aile`,
    `Öğretmen bileşik puanları (net %35, veli memnuniyeti %25, ödev %15, devam %15, dönüş hızı %10): ${t.map((x) => `${x.rank}. ${x.name} ${num(x.composite)} (dönüş ${x.replyHours} sa)`).join('; ')}`,
    `Risk öğrencileri (${risk.length}): ${risk.map((r) => `${r.name} ${r.className} — ${r.reasons.join(', ')}`).join('; ')}`,
    `Ön kayıt: ${funnel.active} aktif aday, ${funnel.stages.map((s) => `${s.label} ${s.count}`).join(', ')}; dönüşüm %${funnel.conversionRate}`,
  ].join('\n');
}

export function localAdminReport(): string {
  const o = getOverview();
  const f = getFinance();
  const lv = getLevelSummaries();
  const br = getBranchRows();
  const t = getTeacherRows();
  const risk = getRiskRows();
  const leads = getLeads();
  const netBr = br.filter((b) => b.metric !== 'KAZANIM');
  const up = [...netBr].sort((a, b) => b.change - a.change)[0];
  const down = [...netBr].sort((a, b) => a.change - b.change)[0];
  const lgs = lv.find((l) => l.level === 'lgs')!;
  const yks = lv.find((l) => l.level === 'yks')!;
  const mez = lv.find((l) => l.level === 'mezun')!;
  const lowest = t[t.length - 1];
  const slowest = [...t].sort((a, b) => b.replyHours - a.replyHours)[0];
  const trial = leads.filter((l) => l.stage === 'deneme' || l.stage === 'gorusme');
  const high = risk.filter((r) => r.level === 'high');
  const pm = f.months[f.currentIndex];
  const prev = f.months[f.currentIndex - 1];

  return [
    'Genel tablo:',
    `Kurumda ${o.students} öğrenci var; doluluk %${o.occupancy}. Geçen yıla göre %${num(o.growthPct)} büyüdük, ${o.target} hedefine ${o.toTarget} öğrenci kaldı. Bugünkü derse katılım ${o.todayPresent}/${o.todayExpected}.`,
    '',
    'Akademik:',
    `- LGS ortalaması ${num(lgs.avgLast)} net; Türkiye ortalamasının (${num(lgs.turkeyAvg ?? 0)}) ${num(lgs.avgLast - (lgs.turkeyAvg ?? 0))} net üstünde.`,
    `- YKS grubunda TYT ortalaması ${num(yks.avgLast)}, mezunlarda ${num(mez.avgLast)} net (Türkiye ${num(yks.turkeyAvg ?? 0)}).`,
    `- En çok yükselen şube ${up.name} (+${num(up.change)}), dikkat isteyen şube ${down.name} (${num(down.change)}).`,
    '',
    'Finans:',
    `- ${pm.name} tahsilatı %${pm.rate} (${tl(pm.collected)}); ${prev ? `${prev.name} %${prev.rate} idi, ` : ''}geçen yıl aynı ay %${pm.lastYearRate}.`,
    `- Geciken toplam ${tl(f.overdueTotal)}, ${f.overdueFamilyCount} aile. En uzun gecikme: ${f.overdue[0].parentName} (${f.overdue[0].daysLate} gün, ${tl(f.overdue[0].amount)}).`,
    '',
    'Öğretmenler:',
    `- Bileşik puanda ilk üç: ${t.slice(0, 3).map((x) => `${x.name} (${num(x.composite)})`).join(', ')}.`,
    `- Destek gereken: ${lowest.name} (${num(lowest.composite)}). Veli dönüş süresi en uzun olan ${slowest.name} (${slowest.replyHours} saat).`,
    '',
    'Bu hafta yapılacaklar:',
    `- Yüksek riskli ${high.length} öğrenci (${high.map((r) => r.name).join(', ')}) için Elif Şahin ile rehberlik görüşmesi planlansın.`,
    `- Gecikmesi 30 günü aşan aileler (${f.overdue.filter((x) => x.daysLate > 30).map((x) => x.parentName).join(', ')}) ile ödeme planı görüşmesi yapılsın.`,
    `- Görüşme/deneme dersi aşamasındaki ${trial.length} aday (${trial.map((l) => l.studentName).join(', ')}) bu hafta aranıp kayda davet edilsin.`,
    `- ${slowest.name} ile veli mesajlarına 24 saat içinde dönüş konusu konuşulsun.`,
  ].join('\n');
}

export async function generateAdminReport(): Promise<AdminAIResult> {
  const r = await callEdgeFunction({ mode: 'admin_weekly_report', contextText: adminContextText() }, 20000);
  if (r.ok && typeof r.data?.content === 'string' && r.data.content.trim()) {
    return { text: r.data.content.trim(), source: 'gemini' };
  }
  return { text: localAdminReport(), source: 'local' };
}
