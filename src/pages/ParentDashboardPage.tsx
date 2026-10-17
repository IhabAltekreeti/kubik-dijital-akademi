import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  IdCard,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Repeat,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  XCircle,
} from 'lucide-react';
import RoleLayout from '@/layouts/RoleLayout';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { getCurrentUser, loginAsDemoStudentByEmail } from '@/services/authService';
import {
  buildWeeklySummary,
  examMax,
  examTotal,
  formatMinutes,
  getChildOverview,
  getChildrenForParent,
  getExamTypes,
  getParentMessages,
  sendParentMessage,
  type ChildOverview,
  type ParentMessage,
} from '@/services/parentService';
import { demoParents, type AttendanceStatus, type ExamType } from '@/data/parentDemo';
import { subjectLabels } from '@/data/programs';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function dateFromDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function fmtDate(d: Date | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }): string {
  return new Date(d).toLocaleDateString('tr-TR', opts);
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function SectionTitle({ icon: Icon, title, right }: { icon: typeof Bell; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      </div>
      {right}
    </div>
  );
}

const attendanceStyle: Record<AttendanceStatus, { label: string; cls: string }> = {
  present: { label: 'Katıldı', cls: 'bg-success-50 text-success-700' },
  late: { label: 'Geç kaldı', cls: 'bg-warning-50 text-warning-700' },
  absent: { label: 'Devamsız', cls: 'bg-error-50 text-error-700' },
  excused: { label: 'İzinli', cls: 'bg-navy-100 text-navy-600' },
};

/* ------------------------------------------------------------------ */
/* sections                                                            */
/* ------------------------------------------------------------------ */

function ChildHero({ o }: { o: ChildOverview }) {
  const lastExam = o.extra.exams[o.extra.exams.length - 1];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 p-6 sm:p-7 text-white">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand-500/20 blur-2xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-2 ring-white/20">
            {initials(o.student.displayName)}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold truncate">{o.student.displayName}</h2>
            <p className="text-sm text-brand-100 mt-0.5">
              {o.extra.className} · {o.extra.programLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                <Target className="h-3.5 w-3.5" /> {o.extra.goal}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                <UserCheck className="h-3.5 w-3.5" /> Rehber: {o.extra.counselor}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
          {[
            { k: `%${o.attendanceRate}`, v: 'Devam oranı' },
            { k: `${examTotal(lastExam)}`, v: `Son ${lastExam.type} neti` },
            { k: `${lastExam.rank}/${lastExam.rankOf}`, v: 'Kurum sırası' },
          ].map((s) => (
            <div key={s.v} className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-center">
              <p className="text-lg sm:text-xl font-bold">{s.k}</p>
              <p className="text-[11px] text-brand-100 mt-0.5">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiRow({ o }: { o: ChildOverview }) {
  const goalPct = Math.min(100, Math.round((o.weekTotal / o.extra.weeklyGoalMinutes) * 100));
  const done = o.assignments.filter((a) => a.status === 'submitted' || a.status === 'graded').length;
  const items = [
    {
      icon: Clock,
      tone: 'bg-brand-50 text-brand-600',
      label: 'Bu hafta çalışma',
      value: formatMinutes(o.weekTotal),
      sub: (
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${goalPct}%` }} />
          </div>
          <p className="text-[11px] text-navy-400 mt-1">Hedefe ulaşma: %{Math.round((o.weekTotal / o.extra.weeklyGoalMinutes) * 100)}</p>
        </div>
      ),
    },
    {
      icon: TrendingUp,
      tone: 'bg-success-50 text-success-600',
      label: 'Soru başarısı',
      value: o.successRate !== null ? `%${o.successRate}` : '—',
      sub: <p className="text-[11px] text-navy-400 mt-2">{o.solvedCount} soru çözüldü</p>,
    },
    {
      icon: BookOpen,
      tone: 'bg-warning-50 text-warning-600',
      label: 'Ödevler',
      value: `${done}/${o.assignments.length}`,
      sub: <p className="text-[11px] text-navy-400 mt-2">teslim edildi</p>,
    },
    {
      icon: XCircle,
      tone: 'bg-error-50 text-error-600',
      label: 'Tekrar bekleyen hata',
      value: `${o.openMistakes}`,
      sub: <p className="text-[11px] text-navy-400 mt-2">hata defterinde</p>,
    },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((i) => (
        <Card key={i.label} padding="sm" className="!p-5">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${i.tone}`}>
            <i.icon className="h-5 w-5" />
          </div>
          <p className="mt-3 text-xs text-navy-400">{i.label}</p>
          <p className="text-2xl font-bold text-navy-900">{i.value}</p>
          {i.sub}
        </Card>
      ))}
    </div>
  );
}

function AISummary({ o, greeting }: { o: ChildOverview; greeting: string }) {
  const lines = buildWeeklySummary(o, greeting);
  return (
    <Card className="relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-brand-100/60 blur-2xl" />
      <div className="relative">
        <SectionTitle
          icon={Bot}
          title="Kübik AI · Haftalık Değerlendirme"
          right={
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
              <Sparkles className="h-3 w-3" /> Otomatik rapor
            </span>
          }
        />
        <div className="space-y-2.5">
          {lines.map((l, i) => (
            <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-navy-900 font-medium' : 'text-navy-600'}`}>
              {l}
            </p>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-navy-50 border border-navy-100 p-4">
          <p className="text-xs font-semibold text-navy-700 mb-2">Evde yapabilecekleriniz</p>
          <ul className="space-y-1.5 text-sm text-navy-600">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />Deneme sonrası netlerden çok yapılan hataları konuşun.</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />Günlük çalışma hedefini birlikte takip edin; küçük başarıları kutlayın.</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />Uyku ve ekran süresine dikkat edin, özellikle deneme öncesi akşam.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

function Announcements({ o }: { o: ChildOverview }) {
  const iconFor = { meeting: CalendarDays, exam: GraduationCap, info: Megaphone } as const;
  return (
    <Card className="h-full">
      <SectionTitle icon={Bell} title="Dershaneden Duyurular" />
      <div className="space-y-3">
        {o.announcements.map((n) => {
          const Icon = iconFor[n.kind];
          const d = dateFromDays(n.inDays);
          return (
            <div key={n.id} className="flex gap-3 rounded-xl border border-navy-100 p-3.5 hover:bg-navy-50 transition-colors">
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-900 text-white leading-none">
                <span className="text-sm font-bold">{d.getDate()}</span>
                <span className="text-[9px] uppercase mt-0.5">{fmtDate(d, { month: 'short' })}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy-900 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-brand-600" />
                  {n.title}
                </p>
                <p className="text-xs text-navy-500 mt-0.5 leading-relaxed">{n.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ExamResults({ o }: { o: ChildOverview }) {
  const types = getExamTypes(o.extra);
  const [type, setType] = useState<ExamType>(types[0]);
  const exams = o.extra.exams.filter((e) => e.type === type);
  const last = exams[exams.length - 1];
  const prev = exams[exams.length - 2];
  const max = examMax(last);
  const totals = exams.map(examTotal);
  const minT = Math.max(0, Math.min(...totals) - 10);
  const diff = prev ? Math.round((examTotal(last) - examTotal(prev)) * 100) / 100 : 0;

  return (
    <Card>
      <SectionTitle
        icon={BarChart3}
        title="Deneme Sonuçları"
        right={
          types.length > 1 ? (
            <div className="inline-flex rounded-lg bg-navy-100 p-1">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    type === t ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : undefined
        }
      />

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs text-navy-400">Son deneme · {last.name}</p>
              <p className="text-3xl font-bold text-navy-900">
                {examTotal(last)} <span className="text-base font-medium text-navy-400">/ {max} net</span>
              </p>
            </div>
            {prev && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  diff >= 0 ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
                }`}
              >
                {diff >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {diff >= 0 ? '+' : ''}
                {diff} net
              </span>
            )}
          </div>

          <div className="mt-4 flex items-end gap-3 h-44 border-b border-navy-100">
            {exams.map((e) => {
              const t = examTotal(e);
              const h = ((t - minT) / (max - minT)) * 100;
              const isLast = e.id === last.id;
              return (
                <div key={e.id} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 group">
                  <span className={`text-[11px] font-semibold ${isLast ? 'text-brand-700' : 'text-navy-500'}`}>{t}</span>
                  <div
                    className={`w-full max-w-[56px] rounded-t-lg transition-all ${
                      isLast ? 'bg-gradient-to-t from-brand-600 to-brand-400' : 'bg-navy-200 group-hover:bg-navy-300'
                    }`}
                    style={{ height: `${Math.max(8, h)}%` }}
                    title={`${e.name} · ${t} net · ${e.score} puan`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-2">
            {exams.map((e) => (
              <p key={e.id} className="flex-1 text-center text-[10px] text-navy-400">
                {fmtDate(dateFromDays(-e.daysAgo), { day: 'numeric', month: 'short' })}
              </p>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="text-xs font-semibold text-navy-700 mb-3">Ders bazında son deneme</p>
          <div className="space-y-3">
            {last.sections.map((s) => {
              const pct = Math.round((s.net / s.max) * 100);
              const prevS = prev?.sections.find((x) => x.label === s.label);
              const d = prevS ? Math.round((s.net - prevS.net) * 100) / 100 : 0;
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-navy-700">{s.label}</span>
                    <span className="text-navy-500">
                      <b className="text-navy-900">{s.net}</b>/{s.max}
                      {prevS && (
                        <span className={`ml-1.5 ${d >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                          {d >= 0 ? '▲' : '▼'}
                          {Math.abs(d)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 70 ? 'bg-success-500' : pct >= 50 ? 'bg-brand-500' : 'bg-warning-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-navy-50 p-3 text-center">
              <p className="text-[11px] text-navy-400">Puan</p>
              <p className="text-base font-bold text-navy-900">{last.score}</p>
            </div>
            <div className="rounded-xl bg-navy-50 p-3 text-center">
              <p className="text-[11px] text-navy-400">Kurum sırası</p>
              <p className="text-base font-bold text-navy-900">
                {last.rank}
                <span className="text-xs font-medium text-navy-400">/{last.rankOf}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Attendance({ o }: { o: ChildOverview }) {
  const c = o.attendanceCounts;
  return (
    <Card className="h-full">
      <SectionTitle icon={CalendarCheck} title="Devam Durumu" right={<span className="text-xs text-navy-400">Son 2 hafta</span>} />
      <div className="flex items-center gap-4 mb-5">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-navy-100" />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${o.attendanceRate} 100`}
              className="text-success-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-navy-900">%{o.attendanceRate}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-navy-500">Katıldı</span><b className="text-navy-900">{c.present}</b>
          <span className="text-navy-500">Geç kaldı</span><b className="text-navy-900">{c.late}</b>
          <span className="text-navy-500">Devamsız</span><b className="text-navy-900">{c.absent}</b>
          <span className="text-navy-500">İzinli</span><b className="text-navy-900">{c.excused}</b>
        </div>
      </div>
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {o.extra.attendance.map((a, i) => {
          const st = attendanceStyle[a.status];
          return (
            <div key={i} className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-navy-50">
              <div className="min-w-0">
                <p className="text-sm text-navy-800 truncate">{a.lesson}</p>
                <p className="text-[11px] text-navy-400">{fmtDate(dateFromDays(-a.daysAgo), { day: 'numeric', month: 'long', weekday: 'short' })}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function WeeklyStudy({ o }: { o: ChildOverview }) {
  const max = Math.max(...o.weeklyMinutes.map((d) => d.minutes), o.extra.weeklyGoalMinutes / 7);
  const dailyGoal = o.extra.weeklyGoalMinutes / 7;
  return (
    <Card className="h-full">
      <SectionTitle icon={Clock} title="Haftalık Çalışma" right={<span className="text-xs text-navy-400">Günlük hedef: {formatMinutes(Math.round(dailyGoal))}</span>} />
      <div className="relative h-44 flex items-end gap-3">
        <div className="absolute left-0 right-0 border-t border-dashed border-brand-300" style={{ bottom: `${(dailyGoal / max) * 100}%` }} />
        {o.weeklyMinutes.map((d, i) => {
          const ok = d.minutes >= dailyGoal;
          return (
            <div key={d.day} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
              <span className="text-[10px] text-navy-400">{d.minutes}</span>
              <div
                className={`w-full max-w-[40px] rounded-t-md ${ok ? 'bg-success-500' : 'bg-warning-500/80'} ${i === 6 ? 'ring-2 ring-offset-2 ring-brand-300' : ''}`}
                style={{ height: `${(d.minutes / max) * 100}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-2">
        {o.weeklyMinutes.map((d, i) => (
          <p key={d.day} className={`flex-1 text-center text-[11px] ${i === 6 ? 'font-semibold text-brand-700' : 'text-navy-400'}`}>
            {i === 6 ? 'Bugün' : d.label}
          </p>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-[11px] text-navy-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success-500" />Hedefe ulaştı</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-warning-500/80" />Hedefin altında</span>
      </div>
    </Card>
  );
}

function SubjectAndTopics({ o }: { o: ChildOverview }) {
  return (
    <Card className="h-full">
      <SectionTitle icon={Award} title="Ders ve Konu Durumu" />
      {o.subjectRates.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="Henüz veri yok" description="Öğrenci soru çözdükçe burada görünecek." />
      ) : (
        <>
          <div className="space-y-3">
            {o.subjectRates.map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-navy-700">{subjectLabels[s.subject] ?? s.label}</span>
                  <span className="text-navy-500">%{s.rate} · {s.attempts} soru</span>
                </div>
                <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.rate >= 75 ? 'bg-success-500' : s.rate >= 55 ? 'bg-brand-500' : 'bg-warning-500'}`}
                    style={{ width: `${s.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-success-50 border border-success-100 p-3.5">
              <p className="text-xs font-semibold text-success-700 mb-2 flex items-center gap-1.5"><Award className="h-3.5 w-3.5" />Güçlü konular</p>
              {o.strengths.length ? (
                <ul className="space-y-1">
                  {o.strengths.map((t) => (
                    <li key={t.label} className="text-xs text-navy-700 flex justify-between"><span>{t.label}</span><b>%{t.rate}</b></li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-navy-500">Yeterli veri oluştuğunda görünecek.</p>
              )}
            </div>
            <div className="rounded-xl bg-warning-50 border border-warning-100 p-3.5">
              <p className="text-xs font-semibold text-warning-700 mb-2 flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5" />Desteklenecek konular</p>
              {o.weaknesses.length ? (
                <ul className="space-y-1">
                  {o.weaknesses.map((t) => (
                    <li key={t.label} className="text-xs text-navy-700 flex justify-between"><span>{t.label}</span><b>{t.incorrect} hata</b></li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-navy-500">Şu an tekrar gerektiren konu yok.</p>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

function HomeworkAndExams({ o }: { o: ChildOverview }) {
  const statusMap = {
    not_started: { l: 'Başlamadı', c: 'bg-navy-100 text-navy-600' },
    in_progress: { l: 'Devam ediyor', c: 'bg-brand-50 text-brand-700' },
    submitted: { l: 'Teslim edildi', c: 'bg-success-50 text-success-700' },
    graded: { l: 'Notlandı', c: 'bg-success-50 text-success-700' },
  } as const;
  return (
    <Card className="h-full">
      <SectionTitle icon={BookOpen} title="Ödevler ve Yaklaşan Sınavlar" />
      <div className="space-y-2.5">
        {o.assignments.map((a) => {
          const st = statusMap[a.status];
          const overdue = (a.status === 'not_started' || a.status === 'in_progress') && new Date(a.dueDate) < new Date();
          return (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate">{a.title}</p>
                <p className="text-[11px] text-navy-400">
                  {subjectLabels[a.subject]} · Son teslim {fmtDate(a.dueDate)}
                  {a.score !== null && <> · <b className="text-navy-700">{a.score} puan</b></>}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${overdue ? 'bg-error-50 text-error-700' : st.c}`}>
                {overdue ? 'Gecikti' : st.l}
              </span>
            </div>
          );
        })}
        {o.upcomingExams.map((e) => {
          const days = Math.ceil((new Date(e.examDate).getTime() - Date.now()) / 86400000);
          return (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl bg-navy-900 text-white p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{e.title}</p>
                <p className="text-[11px] text-navy-300 truncate">{e.topics.join(', ')}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">{days} gün kaldı</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TeacherNotes({ o }: { o: ChildOverview }) {
  const toneCls = {
    positive: 'border-l-success-500',
    neutral: 'border-l-brand-500',
    attention: 'border-l-warning-500',
  } as const;
  return (
    <Card className="h-full">
      <SectionTitle icon={MessageSquare} title="Öğretmen Notları" />
      <div className="space-y-3">
        {o.extra.notes.map((n, i) => {
          const t = o.extra.teachers.find((x) => x.id === n.teacherId);
          return (
            <div key={i} className={`rounded-xl border border-navy-100 border-l-4 ${toneCls[n.tone]} p-4`}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy-700">
                    {initials(t?.name ?? '?')}
                  </div>
                  <p className="text-sm font-semibold text-navy-900">
                    {t?.name} <span className="font-normal text-navy-400">· {t?.branch}</span>
                  </p>
                </div>
                <span className="text-[11px] text-navy-400">{fmtDate(dateFromDays(-n.daysAgo))}</span>
              </div>
              <p className="text-sm text-navy-600 leading-relaxed">{n.text}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ContactTeacher({ o, parentId }: { o: ChildOverview; parentId: string }) {
  const [teacherId, setTeacherId] = useState(o.extra.teachers[0]?.id ?? '');
  const [kind, setKind] = useState<ParentMessage['kind']>('message');
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const [messages, setMessages] = useState<ParentMessage[]>(() => getParentMessages(parentId, o.student.id));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = o.extra.teachers.find((x) => x.id === teacherId);
    if (!t || !text.trim()) return;
    sendParentMessage({ parentId, studentId: o.student.id, teacherId: t.id, teacherName: t.name, kind, text: text.trim() });
    setMessages(getParentMessages(parentId, o.student.id));
    setText('');
    setSent(kind === 'meeting' ? `Görüşme talebiniz ${t.name}'a iletildi.` : `Mesajınız ${t.name}'a iletildi.`);
    setTimeout(() => setSent(null), 3500);
  }

  return (
    <Card>
      <SectionTitle icon={Send} title="Öğretmenle İletişim" />
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="h-10 rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {o.extra.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.branch})
              </option>
            ))}
          </select>
          <div className="inline-flex rounded-xl bg-navy-100 p-1">
            {(['message', 'meeting'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${kind === k ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'}`}
              >
                {k === 'message' ? 'Mesaj' : 'Görüşme talebi'}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={kind === 'meeting' ? 'Uygun olduğunuz gün ve saati yazabilirsiniz…' : 'Mesajınızı yazın…'}
          className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 disabled:opacity-40 transition-colors"
        >
          <Send className="h-4 w-4" />
          Gönder
        </button>
        {sent && (
          <p className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" /> {sent}
          </p>
        )}
      </form>
      {messages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-navy-100 space-y-2 max-h-72 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className="rounded-lg bg-navy-50 px-3 py-2">
              <p className="text-[11px] text-navy-400">
                {m.kind === 'meeting' ? 'Görüşme talebi' : 'Mesaj'} → {m.teacherName} · {fmtDate(m.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-navy-700 mt-0.5">{m.text}</p>
              {m.reply && (
                <div className="mt-2 rounded-lg border-l-2 border-brand-500 bg-white px-2.5 py-1.5">
                  <p className="text-[11px] font-semibold text-brand-700">
                    {m.reply.teacherName} cevapladı · {fmtDate(m.reply.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-navy-700 mt-0.5 whitespace-pre-line">{m.reply.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function StudentInfoCard({ o, parent }: { o: ChildOverview; parent?: { displayName: string; relation: string; phone: string } }) {
  const i = o.extra.info;
  const birth = new Date(i.birthDate);
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 86400000));
  const years = Math.max(1, Math.ceil((Date.now() - new Date(i.enrolledAt).getTime()) / (365.25 * 86400000)));
  const rows: [string, string][] = [
    ['Öğrenci no', i.studentNo],
    ['Okulu', i.school],
    ['Doğum tarihi', `${fmtDate(birth, { day: 'numeric', month: 'long', year: 'numeric' })} (${age} yaş)`],
    ['Şube', o.extra.className],
    ['Kayıt', `${fmtDate(i.enrolledAt, { month: 'long', year: 'numeric' })} · Kübik'te ${years}. yılı`],
    ['Ders günleri', i.schedule],
    ['Servis', i.shuttle],
    ['Rehber öğretmen', o.extra.counselor],
    ['Sağlık notu', i.healthNote],
  ];
  if (parent) rows.push(['Kayıtlı veli', `${parent.displayName} (${parent.relation}) · ${parent.phone}`]);
  return (
    <Card className="h-full">
      <SectionTitle icon={IdCard} title="Öğrenci Bilgileri" />
      <dl className="divide-y divide-navy-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2">
            <dt className="text-xs text-navy-400 shrink-0">{k}</dt>
            <dd className="text-xs font-medium text-navy-800 text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Payment({ o }: { o: ChildOverview }) {
  const p = o.extra.payment;
  const pct = Math.round((p.paidInstallments / p.totalInstallments) * 100);
  const fmt = (n: number) => n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
  return (
    <Card>
      <SectionTitle icon={CreditCard} title="Ödeme Planı" />
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-navy-500">
          <b className="text-navy-900 text-lg">{p.paidInstallments}</b> / {p.totalInstallments} taksit ödendi
        </p>
        <p className="text-xs text-navy-400">%{pct}</p>
      </div>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: p.totalInstallments }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < p.paidInstallments ? 'bg-success-500' : i === p.paidInstallments ? 'bg-warning-500' : 'bg-navy-100'}`} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-warning-50 border border-warning-100 px-4 py-3">
        <div>
          <p className="text-[11px] text-warning-700">Sıradaki taksit</p>
          <p className="text-sm font-semibold text-navy-900">{fmtDate(dateFromDays(p.nextDueInDays))}</p>
        </div>
        <p className="text-lg font-bold text-navy-900">{fmt(p.installmentAmount)}</p>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function ParentDashboardPage() {
  const user = getCurrentUser();
  const children = useMemo(() => (user ? getChildrenForParent(user.id) : []), [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [childId, setChildId] = useState<string | null>(children[0]?.id ?? null);
  const child = children.find((c) => c.id === childId) ?? children[0];
  const overview = useMemo(() => (child ? getChildOverview(child) : null), [child]);

  const parentMeta = demoParents.find((p) => p.id === user?.id);
  const greeting = parentMeta ? `${parentMeta.displayName.split(' ')[0]} ${parentMeta.honorific}` : user?.displayName ?? 'Sayın Veli';
  const otherDemo = demoParents.find((p) => p.id !== user?.id);

  function switchDemoParent() {
    if (!otherDemo) return;
    const r = loginAsDemoStudentByEmail(otherDemo.email);
    if (r.success) window.location.reload();
  }

  return (
    <RoleLayout pageTitle="Veli Paneli" pageDescription="Çocuğunuzun gelişimini anlık takip edin" role="parent">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Hoş geldiniz, {greeting} 👋</h2>
            <p className="text-sm text-navy-500 mt-1">
              {fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {children.length > 1 &&
              children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChildId(c.id)}
                  className={`h-9 px-3 rounded-lg text-sm font-medium ${c.id === child?.id ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-700'}`}
                >
                  {c.displayName.split(' ')[0]}
                </button>
              ))}
            {otherDemo && user?.isDemo && (
              <button
                onClick={switchDemoParent}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-dashed border-navy-300 text-xs font-medium text-navy-600 hover:bg-white"
                title="Sadece demo içindir"
              >
                <Repeat className="h-3.5 w-3.5" />
                Demo: {otherDemo.displayName}
              </button>
            )}
          </div>
        </div>

        {!overview ? (
          <Card padding="lg">
            <EmptyState
              icon={<AlertTriangle className="h-7 w-7" />}
              title="Bağlı öğrenci bulunamadı"
              description="Hesabınıza bağlı öğrenci kaydı yok. Dershane yönetimi ile iletişime geçebilirsiniz."
            />
          </Card>
        ) : (
          <>
            <ChildHero o={overview} />
            <KpiRow o={overview} />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><AISummary o={overview} greeting={greeting} /></div>
              <Announcements o={overview} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><ExamResults key={overview.student.id} o={overview} /></div>
              <Attendance o={overview} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <WeeklyStudy o={overview} />
              <SubjectAndTopics o={overview} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <TeacherNotes o={overview} />
              <HomeworkAndExams o={overview} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <StudentInfoCard o={overview} parent={parentMeta} />
              <ContactTeacher key={overview.student.id} o={overview} parentId={user!.id} />
              <Payment o={overview} />
            </div>
          </>
        )}
      </div>
    </RoleLayout>
  );
}
