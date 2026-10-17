import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Bot, ClipboardPlus, MessageSquare, RefreshCw, Sparkles, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import TeacherLayout from './TeacherLayout';
import { AIText, RiskChip, SectionTitle, StudentLink, barColor } from './shared';
import { getAttentionList, getClassStats, getClasses, getTeacherMessages } from '@/services/teacherService';
import { analyzeClass, type AIResult } from '@/services/teacherAIService';
import type { ClassId } from '@/data/teacherDemo';

export default function TeacherAIPage() {
  const [params, setParams] = useSearchParams();
  const classes = getClasses();
  const classId = (classes.find((c) => c.id === params.get('sube'))?.id ?? classes[0].id) as ClassId;
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setResult(null);
    Promise.all([analyzeClass(classId), new Promise((r) => setTimeout(r, 900))]).then(([r]) => {
      if (!alive) return;
      setResult(r);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [classId, run]);

  const st = getClassStats(classId);
  const weak = [...st.topicAvgs].sort((a, b) => a.avg - b.avg).slice(0, 3);
  const attention = getAttentionList(classId).slice(0, 5);
  const pendingMsgs = getTeacherMessages().filter((m) => m.status !== 'replied').length;

  return (
    <TeacherLayout title="Kübik AI" description="Şube analizi ve veli iletişiminde yapay zeka desteği">
      <div className="flex flex-wrap items-center gap-2">
        {classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setParams({ sube: c.id })}
            className={`h-10 px-4 rounded-xl text-sm font-semibold ${c.id === classId ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-brand-100/60 blur-2xl" />
          <div className="relative">
            <SectionTitle
              icon={Bot}
              title={`Haftalık Şube Analizi · ${st.cls.name}`}
              subtitle={`${st.cls.subjectLabel} · ${st.studentCount} öğrenci · ${st.cls.exams.length} deneme verisi`}
              right={
                <button
                  onClick={() => setRun((x) => x + 1)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-navy-200 text-xs font-semibold text-navy-600 hover:bg-navy-50 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Yenile
                </button>
              }
            />
            {loading ? (
              <div className="space-y-3 py-2">
                <p className="flex items-center gap-2 text-sm font-medium text-brand-700">
                  <Sparkles className="h-4 w-4 animate-pulse" /> Kübik AI şube verilerini inceliyor…
                </p>
                {[90, 75, 82, 60, 70].map((w, i) => (
                  <div key={i} className="h-3 rounded bg-navy-100 animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              result && <AIText text={result.text} />
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle icon={Target} title="Öncelikli Konular" />
            <div className="space-y-3">
              {weak.map((t) => (
                <div key={t.topic}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-navy-800">{t.topic}</span>
                    <span className="text-xs text-navy-500">%{t.avg}</span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor(t.avg)}`} style={{ width: `${t.avg}%` }} />
                  </div>
                  <Link
                    to={`/teacher/assignments?sube=${classId}&konu=${encodeURIComponent(t.topic)}`}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <ClipboardPlus className="h-3.5 w-3.5" /> Bu konudan ödev ver
                  </Link>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle icon={AlertTriangle} title="Takip Listesi" />
            <div className="space-y-3">
              {attention.map(({ student, reasons }) => (
                <div key={student.id}>
                  <StudentLink s={student} />
                  <div className="mt-1.5 flex flex-wrap gap-1 pl-12">
                    {reasons.slice(0, 2).map((r) => (
                      <RiskChip key={r.label} level={r.level} label={r.label} />
                    ))}
                  </div>
                </div>
              ))}
              {attention.length === 0 && <p className="text-sm text-navy-400">Bu şubede takip gerektiren öğrenci yok.</p>}
            </div>
          </Card>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-brand-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-navy-900">Veli mesajlarına AI taslak</p>
            <p className="text-sm text-navy-500">
              {pendingMsgs} mesaj cevap bekliyor. Kübik AI, öğrencinin netlerine ve devamına bakarak kişisel bir cevap taslağı hazırlar; siz düzenleyip gönderirsiniz.
            </p>
          </div>
          <Link to="/teacher/messages" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 whitespace-nowrap">
            <Sparkles className="h-4 w-4" /> Mesajlara git
          </Link>
        </div>
      </Card>
    </TeacherLayout>
  );
}
