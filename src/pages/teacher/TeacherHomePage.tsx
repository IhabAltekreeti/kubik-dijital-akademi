import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import TeacherLayout from './TeacherLayout';
import { AIText, Avatar, KpiCard, NetChange, RiskChip, SectionTitle, StudentLink, fmtDate, relTime } from './shared';
import {
  dayNames,
  getAttentionList,
  getClassAssignments,
  getClassStats,
  getClasses,
  getNextTeachingDay,
  getSlotsForDay,
  getStudents,
  getTeacherMessages,
  slotState,
} from '@/services/teacherService';
import { demoTeacher } from '@/data/teacherDemo';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

function TodaySchedule() {
  const today = new Date();
  const slots = getSlotsForDay(today.getDay());
  const next = getNextTeachingDay(today);
  const classes = getClasses();
  const remaining = slots.filter((s) => slotState(s) !== 'past');
  const show = remaining.length ? slots : next.slots;
  const heading = remaining.length ? 'Bugün' : next.offset === 1 ? 'Yarın' : dayNames[next.day];

  return (
    <Card className="h-full">
      <SectionTitle icon={CalendarDays} title="Ders Programım" subtitle={`${heading} · ${show.length} ders`} />
      {!remaining.length && slots.length > 0 && (
        <p className="mb-3 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700">Bugünkü dersleriniz tamamlandı 👏 Sıradaki program aşağıda.</p>
      )}
      {!slots.length && <p className="mb-3 rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-500">Bugün dersiniz yok. {heading} programınız:</p>}
      <div className="space-y-3">
        {show.map((s, i) => {
          const cls = classes.find((c) => c.id === s.classId)!;
          const st = remaining.length ? slotState(s) : 'upcoming';
          return (
            <div
              key={i}
              className={`relative rounded-xl border p-4 ${
                st === 'now' ? 'border-brand-300 bg-brand-50' : st === 'past' ? 'border-navy-100 bg-navy-50/60 opacity-60' : 'border-navy-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-navy-900">
                  {s.start} – {s.end}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    s.kind === 'Ders' ? 'bg-brand-100 text-brand-700' : s.kind === 'Etüt' ? 'bg-accent-100 text-accent-700' : 'bg-warning-100 text-warning-700'
                  }`}
                >
                  {st === 'now' ? 'Şu an · ' : ''}
                  {s.kind}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-navy-800">
                {cls.name} · {cls.subjectLabel}
              </p>
              <p className="text-xs text-navy-500 mt-0.5">{s.topic}</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-navy-400">
                <MapPin className="h-3 w-3" /> {cls.room}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AttentionCard() {
  const list = getAttentionList();
  return (
    <Card className="h-full">
      <SectionTitle
        icon={AlertTriangle}
        title="Bu Hafta İlgilenmeniz Gerekenler"
        subtitle="Net düşüşü, çalışmama, eksik ödev ve devamsızlığa göre sıralandı"
        right={
          <Link to="/teacher/students" className="text-xs font-semibold text-brand-600 hover:text-brand-700 whitespace-nowrap">
            Tüm öğrenciler →
          </Link>
        }
      />
      <div className="divide-y divide-navy-100">
        {list.slice(0, 6).map(({ student, reasons }) => (
          <div key={student.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3">
            <div className="sm:w-48 shrink-0">
              <StudentLink s={student} />
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {reasons.map((r) => (
                <RiskChip key={r.label} level={r.level} label={r.label} />
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold text-navy-900">{student.lastNet}</p>
                <NetChange value={student.netChange} />
              </div>
              <Link
                to={`/teacher/students/${student.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 hover:bg-navy-50"
                aria-label={`${student.name} detay`}
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="py-6 text-center text-sm text-navy-400">Bu hafta dikkat gerektiren öğrenci yok 🎉</p>}
      </div>
    </Card>
  );
}

function ClassSummaries() {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {getClasses().map((c) => {
        const st = getClassStats(c.id);
        const weakest = [...st.topicAvgs].sort((a, b) => a.avg - b.avg)[0];
        return (
          <Link key={c.id} to={`/teacher/classes?sube=${c.id}`} className="block">
            <Card hover className="h-full">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-navy-400">{c.subjectLabel} · {st.studentCount} öğrenci</p>
                  <p className="text-lg font-bold text-navy-900">{c.name}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.id === '8-A' ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'}`}>{c.examType}</span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-navy-400">Son deneme ortalaması</p>
                  <p className="text-2xl font-bold text-navy-900">
                    {st.lastAvg} <span className="text-sm font-medium text-navy-400">/ {c.netMax}</span>
                  </p>
                </div>
                <NetChange value={st.change} />
              </div>
              <div className="mt-3 flex items-end gap-1.5 h-10">
                {st.avgNets.map((v, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${i === st.avgNets.length - 1 ? 'bg-brand-500' : 'bg-navy-200'}`}
                    style={{ height: `${Math.max(10, (v / c.netMax) * 100)}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-navy-50 py-2">
                  <p className="text-sm font-bold text-navy-900">%{st.attendanceAvg}</p>
                  <p className="text-[10px] text-navy-400">devam</p>
                </div>
                <div className="rounded-lg bg-navy-50 py-2">
                  <p className="text-sm font-bold text-navy-900">%{st.homeworkRate}</p>
                  <p className="text-[10px] text-navy-400">ödev</p>
                </div>
                <div className="rounded-lg bg-error-50 py-2">
                  <p className="text-sm font-bold text-error-700">%{weakest.avg}</p>
                  <p className="text-[10px] text-error-600 truncate px-1">{weakest.topic}</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function MessagesPreview() {
  const msgs = getTeacherMessages();
  const unread = msgs.filter((m) => m.status === 'sent');
  const show = (unread.length ? unread : msgs).slice(0, 3);
  return (
    <Card className="h-full">
      <SectionTitle
        icon={MessageSquare}
        title="Veli Mesajları"
        subtitle={unread.length ? `${unread.length} okunmamış mesaj` : 'Tüm mesajlar okundu'}
        right={
          <Link to="/teacher/messages" className="text-xs font-semibold text-brand-600 hover:text-brand-700 whitespace-nowrap">
            Gelen kutusu →
          </Link>
        }
      />
      <div className="space-y-2">
        {show.map((m) => (
          <Link key={m.id} to={`/teacher/messages?m=${m.id}`} className="flex gap-3 rounded-xl border border-navy-100 p-3 hover:bg-navy-50">
            <Avatar name={m.parentName ?? 'V'} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-navy-900 truncate">
                  {m.parentName} <span className="font-normal text-navy-400">· {m.studentName}</span>
                </p>
                {m.status === 'sent' && <span className="h-2 w-2 shrink-0 rounded-full bg-error-500" />}
              </div>
              <p className="text-xs text-navy-500 line-clamp-2">{m.text}</p>
              <p className="text-[11px] text-navy-400 mt-1">
                {m.kind === 'meeting' ? 'Görüşme talebi · ' : ''}
                {relTime(m.createdAt)}
              </p>
            </div>
          </Link>
        ))}
        {show.length === 0 && <p className="py-6 text-center text-sm text-navy-400">Henüz mesaj yok.</p>}
      </div>
    </Card>
  );
}

export default function TeacherHomePage() {
  const students = getStudents();
  const attention = getAttentionList();
  const unread = getTeacherMessages().filter((m) => m.status === 'sent').length;
  const today = getSlotsForDay(new Date().getDay());
  const active = getClassAssignments().filter((a) => !a.overdue);
  const pendingSubmissions = active.reduce((t, a) => t + (a.total - a.submitted), 0);

  return (
    <TeacherLayout title="Öğretmen Paneli" description="Şubelerinizi ve öğrencilerinizi tek ekrandan takip edin">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 p-6 sm:p-7 text-white">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-sm text-brand-100">{fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold">
              {greeting()}, {demoTeacher.displayName} 👋
            </h2>
            <p className="mt-1 text-sm text-brand-100">{demoTeacher.branches} · 8-A LGS ve 12-B Sayısal şubeleri</p>
          </div>
          <Link
            to="/teacher/ai"
            className="inline-flex items-center gap-2 self-start lg:self-auto rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/15"
          >
            <Sparkles className="h-4 w-4" /> Kübik AI ile şube analizi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Clock} tone="bg-brand-50 text-brand-600" label="Bugünkü ders" value={today.length} sub={today.length ? `${today[0].start}'de başlıyor` : 'Bugün ders yok'} />
        <KpiCard icon={AlertTriangle} tone="bg-error-50 text-error-600" label="İlgi bekleyen öğrenci" value={attention.length} sub={`${students.length} öğrenci içinden`} />
        <KpiCard icon={MessageSquare} tone="bg-warning-50 text-warning-600" label="Okunmamış veli mesajı" value={unread} sub={<Link to="/teacher/messages" className="text-brand-600 font-medium">Mesajlara git</Link>} />
        <KpiCard icon={ClipboardList} tone="bg-success-50 text-success-600" label="Teslim bekleyen ödev" value={pendingSubmissions} sub={`${active.length} aktif ödevde`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <TodaySchedule />
        <div className="lg:col-span-2">
          <AttentionCard />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClassSummaries />
        </div>
        <MessagesPreview />
      </div>

      <Card className="bg-gradient-to-br from-brand-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <AIText text="Panelde yazdığınız öğretmen notları ve veli mesajlarına verdiğiniz cevaplar, velinin panelinde anında görünür." />
          </div>
          <Link to="/teacher/students/demo-student-ayse" className="text-sm font-semibold text-brand-600 hover:text-brand-700 whitespace-nowrap">
            Ayşe'ye not yaz →
          </Link>
        </div>
      </Card>
    </TeacherLayout>
  );
}
