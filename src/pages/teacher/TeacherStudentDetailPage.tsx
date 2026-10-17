import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  NotebookPen,
  Phone,
  Send,
  Target,
  UserCheck,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import TeacherLayout from './TeacherLayout';
import { Avatar, NetBars, NetChange, RiskChip, SectionTitle, barColor, fmtDate, relTime } from './shared';
import {
  addNoteForStudent,
  getAssignmentsForStudent,
  getNotesForStudent,
  getRiskReasons,
  getStudent,
  getTeacherMessages,
  parentInfoFor,
} from '@/services/teacherService';
import type { DemoTeacherNote } from '@/data/parentDemo';

const toneMeta: Record<DemoTeacherNote['tone'], { label: string; cls: string; chip: string }> = {
  positive: { label: 'Olumlu', cls: 'border-l-success-500', chip: 'bg-success-50 text-success-700' },
  neutral: { label: 'Bilgi', cls: 'border-l-brand-500', chip: 'bg-brand-50 text-brand-700' },
  attention: { label: 'Dikkat', cls: 'border-l-warning-500', chip: 'bg-warning-50 text-warning-700' },
};

function NotesCard({ studentId, firstName, visibleToParent }: { studentId: string; firstName: string; visibleToParent: boolean }) {
  const [notes, setNotes] = useState(() => getNotesForStudent(studentId));
  const [tone, setTone] = useState<DemoTeacherNote['tone']>('positive');
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addNoteForStudent(studentId, tone, text.trim());
    setNotes(getNotesForStudent(studentId));
    setText('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  }

  return (
    <Card className="h-full">
      <SectionTitle icon={NotebookPen} title="Öğretmen Notları" subtitle={visibleToParent ? 'Yazdığınız notlar veli panelinde görünür' : 'Veli paneli bu öğrenci için demo dışında'} />
      <form onSubmit={submit} className="space-y-2.5 mb-4">
        <div className="inline-flex rounded-xl bg-navy-100 p-1">
          {(Object.keys(toneMeta) as DemoTeacherNote['tone'][]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`px-3 h-8 rounded-lg text-xs font-semibold ${tone === t ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'}`}
            >
              {toneMeta[t].label}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={`${firstName} hakkında veliyle paylaşmak istediğiniz notu yazın…`}
          className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 disabled:opacity-40"
        >
          <Send className="h-4 w-4" /> Notu kaydet
        </button>
        {saved && (
          <p className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" /> Not kaydedildi{visibleToParent ? ' ve veli paneline eklendi' : ''}.
          </p>
        )}
      </form>
      <div className="space-y-2.5 max-h-80 overflow-y-auto">
        {notes.map((n) => (
          <div key={n.id} className={`rounded-xl border border-navy-100 border-l-4 ${toneMeta[n.tone].cls} p-3.5`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneMeta[n.tone].chip}`}>{toneMeta[n.tone].label}</span>
              <span className="text-[11px] text-navy-400">
                {n.isNew ? 'Yeni · ' : ''}
                {fmtDate(n.date)}
              </span>
            </div>
            <p className="text-sm text-navy-700 leading-relaxed">{n.text}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="py-4 text-center text-sm text-navy-400">Henüz not yok.</p>}
      </div>
    </Card>
  );
}

export default function TeacherStudentDetailPage() {
  const { id = '' } = useParams();
  const s = getStudent(id);

  if (!s) {
    return (
      <TeacherLayout title="Öğrenci">
        <Card padding="lg">
          <EmptyState icon={<UserCheck className="h-7 w-7" />} title="Öğrenci bulunamadı" description="Bu öğrenci şubelerinizde kayıtlı değil." />
        </Card>
      </TeacherLayout>
    );
  }

  const reasons = getRiskReasons(s);
  const parent = parentInfoFor(s);
  const assignments = getAssignmentsForStudent(s);
  const messages = getTeacherMessages().filter((m) => m.studentId === s.id);
  const first = s.name.split(' ')[0];
  const topics = s.cls.topics.map((t, i) => ({ t, v: s.topicScores[i] })).sort((a, b) => a.v - b.v);
  const examLabels = s.cls.exams.map((e) => e.name);
  const best = Math.max(...s.nets);

  return (
    <TeacherLayout title={s.name} description={`${s.cls.name} · ${s.cls.subjectLabel}`}>
      <Link to="/teacher/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-800">
        <ArrowLeft className="h-4 w-4" /> Öğrenciler
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 p-6 sm:p-7 text-white">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-2 ring-white/20">
              {s.name.split(' ').map((p) => p[0]).join('')}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold truncate">{s.name}</h2>
              <p className="text-sm text-brand-100 mt-0.5">
                {s.cls.name} · {s.studentNo}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                  <Phone className="h-3.5 w-3.5" /> Veli: {parent.name}
                </span>
                {s.linkedStudentId && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-500/20 px-2.5 py-1 text-xs text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Platform verisi canlı
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
            {[
              { k: `${s.lastNet}`, v: `Son ${s.cls.examType} ${s.cls.subjectLabel}` },
              { k: `%${s.attendanceRate}`, v: 'Devam' },
              { k: `${s.homeworkDone}/${s.homeworkTotal}`, v: 'Ödev teslimi' },
            ].map((x) => (
              <div key={x.v} className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-center">
                <p className="text-lg sm:text-xl font-bold">{x.k}</p>
                <p className="text-[11px] text-brand-100 mt-0.5 leading-tight">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3">
          <span className="text-sm font-semibold text-warning-700 mr-1">Dikkat:</span>
          {reasons.map((r) => (
            <RiskChip key={r.label} level={r.level} label={r.label} />
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <SectionTitle
            icon={BarChart3}
            title="Deneme Gelişimi"
            subtitle={`${s.cls.examType} ${s.cls.subjectLabel} · en iyi ${best} net`}
            right={<NetChange value={s.netChange} />}
          />
          <NetBars values={s.nets} labels={examLabels} max={s.cls.netMax} />
          <div className="mt-2 flex gap-3">
            {s.cls.exams.map((e) => (
              <p key={e.id} className="flex-1 text-center text-[10px] leading-tight text-navy-400">
                {e.name.replace('Türkiye Geneli', 'TG').replace('Kübik ', '')}
              </p>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <SectionTitle icon={Target} title="Konu Durumu" subtitle="Zayıftan güçlüye" />
          <div className="space-y-3">
            {topics.map(({ t, v }) => (
              <div key={t}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-navy-800">{t}</span>
                  <span className="text-xs font-semibold text-navy-500">%{v}</span>
                </div>
                <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(v)}`} style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Link
            to={`/teacher/assignments?sube=${s.classId}&konu=${encodeURIComponent(topics[0].t)}`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <ClipboardList className="h-4 w-4" /> {topics[0].t} için şubeye ödev ver →
          </Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <NotesCard studentId={s.id} firstName={first} visibleToParent={!!s.linkedStudentId} />
        <div className="space-y-6">
          <Card>
            <SectionTitle icon={ClipboardList} title="Ödevler" subtitle={`${s.cls.name} şubesine verilen ödevler`} />
            <div className="space-y-2">
              {assignments.map(({ a, status, score }) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-navy-100 px-3.5 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-900 truncate">{a.title}</p>
                    <p className="text-[11px] text-navy-400">Son teslim: {fmtDate(a.dueDate, { day: 'numeric', month: 'short' })}</p>
                  </div>
                  {status === 'submitted' ? (
                    <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-[11px] font-semibold text-success-700">Teslim{score !== null ? ` · ${score}` : ''}</span>
                  ) : status === 'late' ? (
                    <span className="rounded-full bg-error-50 px-2.5 py-0.5 text-[11px] font-semibold text-error-700">Gecikti</span>
                  ) : (
                    <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-semibold text-navy-600">Bekleniyor</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle
              icon={MessageSquare}
              title="Veli İletişimi"
              subtitle={`${parent.name} (${parent.relation}) · ${parent.phone}`}
              right={
                <Link to="/teacher/messages" className="text-xs font-semibold text-brand-600 whitespace-nowrap">
                  Mesajlar →
                </Link>
              }
            />
            {messages.length ? (
              <div className="space-y-2">
                {messages.map((m) => (
                  <Link key={m.id} to={`/teacher/messages?m=${m.id}`} className="flex gap-3 rounded-xl bg-navy-50 px-3 py-2.5 hover:bg-navy-100">
                    <Avatar name={m.parentName ?? 'V'} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-navy-700 line-clamp-2">{m.text}</p>
                      <p className="text-[11px] text-navy-400 mt-0.5">
                        {relTime(m.createdAt)} · {m.status === 'replied' ? 'Cevaplandı' : m.status === 'read' ? 'Okundu' : 'Yeni'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-400">Bu veliden henüz mesaj yok.</p>
            )}
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
}
