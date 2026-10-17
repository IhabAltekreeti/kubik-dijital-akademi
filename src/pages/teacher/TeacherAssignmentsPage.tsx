import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, ClipboardList, ClipboardPlus, Database, FileText, ListChecks } from 'lucide-react';
import Card from '@/components/ui/Card';
import TeacherLayout from './TeacherLayout';
import { SectionTitle, fmtDate } from './shared';
import { createClassAssignment, getClassAssignments, getClass, getClasses } from '@/services/teacherService';
import { sampleQuestions } from '@/data/questions';
import type { ClassId } from '@/data/teacherDemo';

const diffLabel = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' } as const;
const diffCls = { easy: 'bg-success-50 text-success-700', medium: 'bg-warning-50 text-warning-700', hard: 'bg-error-50 text-error-700' } as const;

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export default function TeacherAssignmentsPage() {
  const [params] = useSearchParams();
  const classes = getClasses();
  const initialClass = (classes.find((c) => c.id === params.get('sube'))?.id ?? classes[0].id) as ClassId;

  const [classId, setClassId] = useState<ClassId>(initialClass);
  const cls = getClass(classId)!;
  const [topic, setTopic] = useState<string>(() => {
    const k = params.get('konu');
    return k && cls.topics.includes(k) ? k : cls.topics[0];
  });
  const [mode, setMode] = useState<'bank' | 'simple'>('bank');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [due, setDue] = useState(inDays(3));
  const [extraCount, setExtraCount] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [list, setList] = useState(() => getClassAssignments());
  const [done, setDone] = useState<string | null>(null);

  const bank = useMemo(
    () => sampleQuestions.filter((q) => cls.bankSubjects.includes(q.subject) && (q.program === (cls.examType === 'LGS' ? 'lgs' : 'yks'))),
    [cls],
  );
  const bankTopics = useMemo(() => Array.from(new Set(bank.map((q) => q.topic))), [bank]);
  const [bankTopic, setBankTopic] = useState<string>('all');
  const visibleBank = bank.filter((q) => bankTopic === 'all' || q.topic === bankTopic);

  function changeClass(id: ClassId) {
    setClassId(id);
    const c = getClass(id)!;
    setTopic(c.topics[0]);
    setSelected([]);
    setBankTopic('all');
  }

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const effectiveTitle = title.trim() || `${topic} — ${mode === 'bank' ? 'Soru Seti' : 'Ödev'}`;
  const canSubmit = (mode === 'bank' ? selected.length > 0 : true) && !!due;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    createClassAssignment({
      classId,
      title: effectiveTitle,
      description: description.trim() || (mode === 'bank' ? `${selected.length} soruluk set. Platformdaki Pratik ekranından çözebilirsin.` : 'Detaylar derste verilecektir.'),
      topic,
      dueDate: due,
      questionIds: mode === 'bank' ? selected : [],
      extraQuestionCount: extraCount,
    });
    setList(getClassAssignments());
    const names = classId === '8-A' ? 'Ayşe ve Mehmet' : 'Zeynep';
    setDone(`"${effectiveTitle}" ${cls.name} şubesine atandı. ${names} gibi platform hesabı olan öğrencilerin ekranına düştü.`);
    setTitle('');
    setDescription('');
    setSelected([]);
    setExtraCount(0);
    setTimeout(() => setDone(null), 6000);
  }

  return (
    <TeacherLayout title="Ödevler" description="Şubelerinize ödev verin, teslimleri takip edin">
      <div className="grid xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-3">
          <SectionTitle icon={ClipboardPlus} title="Yeni Ödev" subtitle="Basit ödev ya da soru bankasından seçerek" />
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-navy-500">Şube</span>
                <select
                  value={classId}
                  onChange={(e) => changeClass(e.target.value as ClassId)}
                  className="mt-1 w-full h-10 rounded-xl border border-navy-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.subjectLabel}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-navy-500">Konu</span>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-navy-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {cls.topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-navy-500">Son teslim</span>
                <input
                  type="date"
                  value={due}
                  min={inDays(0)}
                  onChange={(e) => setDue(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-navy-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-navy-500">Başlık</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={effectiveTitle}
                className="mt-1 w-full h-10 rounded-xl border border-navy-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-navy-500">Açıklama</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Öğrencilere not (ör. 'Fasikül s. 42–45 ve aşağıdaki sorular')"
                className="mt-1 w-full rounded-xl border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </label>

            <div className="inline-flex rounded-xl bg-navy-100 p-1">
              {[
                { k: 'bank' as const, l: 'Soru bankasından seç', i: Database },
                { k: 'simple' as const, l: 'Basit ödev', i: FileText },
              ].map((m) => (
                <button
                  key={m.k}
                  type="button"
                  onClick={() => setMode(m.k)}
                  className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold ${mode === m.k ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'}`}
                >
                  <m.i className="h-3.5 w-3.5" /> {m.l}
                </button>
              ))}
            </div>

            {mode === 'bank' ? (
              <div className="rounded-xl border border-navy-100">
                <div className="flex flex-wrap items-center gap-1.5 border-b border-navy-100 p-3">
                  {['all', ...bankTopics].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBankTopic(t)}
                      className={`px-2.5 h-7 rounded-full text-xs font-medium ${bankTopic === t ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}
                    >
                      {t === 'all' ? `Tümü (${bank.length})` : t}
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-semibold text-brand-700">{selected.length} soru seçildi</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-navy-100">
                  {visibleBank.map((q) => (
                    <label key={q.id} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-navy-50/60">
                      <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggle(q.id)} className="mt-1 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-navy-800 line-clamp-2">{q.questionText}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-navy-400">
                          {q.topic}
                          <span className={`rounded-full px-1.5 py-px font-semibold ${diffCls[q.difficulty]}`}>{diffLabel[q.difficulty]}</span>
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between border-t border-navy-100 px-3 py-2">
                  <button type="button" onClick={() => setSelected(visibleBank.map((q) => q.id))} className="text-xs font-semibold text-brand-600">
                    Görünenleri seç
                  </button>
                  <button type="button" onClick={() => setSelected([])} className="text-xs font-medium text-navy-500">
                    Temizle
                  </button>
                </div>
              </div>
            ) : (
              <label className="block max-w-xs">
                <span className="text-xs font-medium text-navy-500">Soru sayısı (kitap / fasikül)</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={extraCount}
                  onChange={(e) => setExtraCount(Number(e.target.value) || 0)}
                  className="mt-1 w-full h-10 rounded-xl border border-navy-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 disabled:opacity-40"
              >
                <ClipboardPlus className="h-4 w-4" /> {cls.name} şubesine ata
              </button>
              <p className="text-xs text-navy-400">Platform hesabı olan öğrencilerin Çalışma Planı'na ve velinin paneline düşer.</p>
            </div>
            {done && (
              <p className="flex items-start gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {done}
              </p>
            )}
          </form>
        </Card>

        <Card className="xl:col-span-2">
          <SectionTitle icon={ListChecks} title="Verilen Ödevler" subtitle={`${list.length} ödev`} />
          <div className="space-y-3">
            {list.map((a) => {
              const pct = Math.round((a.submitted / a.total) * 100);
              return (
                <div key={a.id} className="rounded-xl border border-navy-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900">{a.title}</p>
                      <p className="text-[11px] text-navy-400 mt-0.5">
                        {a.className} · {a.topic}
                        {a.questionCount ? ` · ${a.questionCount} soru` : ''}
                        {a.mode === 'bank' ? ' · Soru bankası' : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.overdue ? 'bg-navy-100 text-navy-600' : 'bg-brand-50 text-brand-700'}`}
                    >
                      {a.overdue ? 'Süresi doldu' : `Son: ${fmtDate(a.dueDate, { day: 'numeric', month: 'short' })}`}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-navy-100 overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 80 ? 'bg-success-500' : pct >= 50 ? 'bg-brand-500' : 'bg-warning-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-navy-700 whitespace-nowrap">
                      {a.submitted}/{a.total} teslim
                    </span>
                  </div>
                  {a.avgScore !== null && <p className="mt-1.5 text-[11px] text-navy-500">Ortalama puan: <b className="text-navy-800">{a.avgScore}</b></p>}
                </div>
              );
            })}
            {list.length === 0 && (
              <p className="py-6 text-center text-sm text-navy-400">
                <ClipboardList className="mx-auto mb-2 h-6 w-6" /> Henüz ödev yok.
              </p>
            )}
          </div>
        </Card>
      </div>
    </TeacherLayout>
  );
}
