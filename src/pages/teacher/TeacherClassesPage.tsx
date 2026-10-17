import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3, ClipboardPlus, Grid3X3, MapPin, Sparkles, Target, Trophy, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import TeacherLayout from './TeacherLayout';
import { NetBars, NetChange, SectionTitle, StudentLink, barColor, heatClass } from './shared';
import { dayNames, getClassStats, getClasses, getStudents } from '@/services/teacherService';
import { weeklySchedule, type ClassId } from '@/data/teacherDemo';

export default function TeacherClassesPage() {
  const [params, setParams] = useSearchParams();
  const classes = getClasses();
  const classId = (classes.find((c) => c.id === params.get('sube'))?.id ?? classes[0].id) as ClassId;
  const st = getClassStats(classId);
  const cls = st.cls;
  const students = getStudents(classId).sort((a, b) => b.lastNet - a.lastNet);
  const slots = weeklySchedule.filter((s) => s.classId === classId);
  const weakest = [...st.topicAvgs].sort((a, b) => a.avg - b.avg);

  return (
    <TeacherLayout title="Şubelerim" description="Şube bazında deneme, konu ve öğrenci analizi">
      <div className="flex flex-wrap items-center gap-2">
        {classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setParams({ sube: c.id })}
            className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors ${
              c.id === classId ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'
            }`}
          >
            {c.name} <span className={`ml-1 text-xs font-normal ${c.id === classId ? 'text-navy-300' : 'text-navy-400'}`}>· {c.subjectLabel}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Öğrenci', value: st.studentCount, sub: cls.programLabel },
          { icon: BarChart3, label: `Son ${cls.examType} ${cls.subjectLabel} ort.`, value: `${st.lastAvg} / ${cls.netMax}`, sub: <NetChange value={st.change} /> },
          { icon: Target, label: 'Devam / Ödev', value: `%${st.attendanceAvg} · %${st.homeworkRate}`, sub: 'şube ortalaması' },
          { icon: Trophy, label: 'Şube birincisi', value: st.topStudent.name.split(' ')[0], sub: `${st.topStudent.lastNet} net` },
        ].map((k) => (
          <Card key={k.label} padding="sm" className="!p-5">
            <k.icon className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-xs text-navy-400">{k.label}</p>
            <p className="text-xl font-bold text-navy-900">{k.value}</p>
            <div className="text-[11px] text-navy-400 mt-1">{k.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <SectionTitle icon={BarChart3} title="Deneme Ortalaması" subtitle={`${cls.examType} · ${cls.subjectLabel} neti (${cls.netMax} soru)`} />
          <NetBars values={st.avgNets} labels={cls.exams.map((e) => e.name)} max={cls.netMax} />
          <div className="mt-2 flex gap-3">
            {cls.exams.map((e) => (
              <p key={e.id} className="flex-1 text-center text-[10px] leading-tight text-navy-400">
                {e.name.replace('Türkiye Geneli', 'TG').replace('Kübik ', '')}
              </p>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <SectionTitle icon={Target} title="Konu Başarısı" subtitle="Şube ortalaması · düşükten yükseğe" />
          <div className="space-y-3">
            {weakest.map((t) => (
              <div key={t.topic}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-navy-800">{t.topic}</span>
                  <span className="text-xs text-navy-500">
                    %{t.avg} {t.struggling > 0 && <span className="text-error-600">· {t.struggling} öğrenci zorlanıyor</span>}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(t.avg)}`} style={{ width: `${t.avg}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to={`/teacher/assignments?sube=${classId}&konu=${encodeURIComponent(weakest[0].topic)}`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800"
            >
              <ClipboardPlus className="h-4 w-4" /> {weakest[0].topic} için ödev ver
            </Link>
            <Link
              to={`/teacher/ai?sube=${classId}`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-brand-200 bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100"
            >
              <Sparkles className="h-4 w-4" /> AI analizi
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={Grid3X3} title="Öğrenci × Konu Isı Haritası" subtitle="Hangi öğrenci hangi konuda zorlanıyor? Hücreye bakmanız yeterli." />
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[720px] text-sm border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-navy-400 px-2">Öğrenci</th>
                {cls.topics.map((t) => (
                  <th key={t} className="text-xs font-medium text-navy-500 px-1 leading-tight">{t}</th>
                ))}
                <th className="text-xs font-medium text-navy-400 px-1">Son net</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-2 py-1">
                    <StudentLink s={s} sub={<p className="text-[11px] text-navy-400">{s.studentNo}</p>} />
                  </td>
                  {s.topicScores.map((v, i) => (
                    <td key={i} className={`rounded-lg text-center text-xs font-semibold py-2.5 ${heatClass(v)}`}>%{v}</td>
                  ))}
                  <td className="text-center">
                    <p className="text-sm font-bold text-navy-900">{s.lastNet}</p>
                    <NetChange value={s.netChange} />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-2 pt-2 text-xs font-semibold text-navy-500">Şube ortalaması</td>
                {st.topicAvgs.map((t) => (
                  <td key={t.topic} className="pt-2 text-center text-xs font-bold text-navy-800">%{t.avg}</td>
                ))}
                <td className="pt-2 text-center text-xs font-bold text-navy-800">{st.lastAvg}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-navy-500">
          {[
            ['%85+', heatClass(90)],
            ['%70–84', heatClass(75)],
            ['%60–69', heatClass(65)],
            ['%45–59', heatClass(50)],
            ['%45 altı', heatClass(30)],
          ].map(([l, c]) => (
            <span key={l} className="inline-flex items-center gap-1.5">
              <span className={`h-3 w-5 rounded ${c}`} /> {l}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={MapPin} title="Haftalık Program" subtitle={`${cls.name} · ${cls.room}`} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {slots.map((s, i) => (
            <div key={i} className="rounded-xl border border-navy-100 p-4">
              <p className="text-xs font-semibold text-brand-600">{dayNames[s.day]}</p>
              <p className="text-sm font-bold text-navy-900 mt-0.5">
                {s.start} – {s.end}
              </p>
              <p className="text-xs text-navy-500 mt-1">
                {s.kind} · {s.topic}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </TeacherLayout>
  );
}
