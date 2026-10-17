import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Search, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import TeacherLayout from './TeacherLayout';
import { NetChange, RiskChip, SectionTitle, StudentLink } from './shared';
import { getClasses, getRiskReasons, getStudents } from '@/services/teacherService';
import type { ClassId } from '@/data/teacherDemo';

type SortKey = 'risk' | 'net' | 'name';

export default function TeacherStudentsPage() {
  const [classId, setClassId] = useState<ClassId | 'all'>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('risk');
  const classes = getClasses();

  const rows = getStudents(classId === 'all' ? undefined : classId)
    .map((s) => {
      const reasons = getRiskReasons(s);
      return { s, reasons, score: reasons.reduce((t, r) => t + (r.level === 'high' ? 3 : r.level === 'medium' ? 2 : 1), 0) };
    })
    .filter(({ s }) => s.name.toLocaleLowerCase('tr-TR').includes(q.toLocaleLowerCase('tr-TR')))
    .sort((a, b) =>
      sort === 'risk' ? b.score - a.score : sort === 'net' ? b.s.lastNet / b.s.cls.netMax - a.s.lastNet / a.s.cls.netMax : a.s.name.localeCompare(b.s.name, 'tr'),
    );

  return (
    <TeacherLayout title="Öğrenciler" description="Tüm şubelerdeki öğrencileriniz">
      <Card>
        <SectionTitle icon={Users} title={`${rows.length} öğrenci`} subtitle="Satıra tıklayarak öğrencinin detayına gidebilirsiniz" />
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Öğrenci ara…"
              className="w-full h-10 rounded-xl border border-navy-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="inline-flex rounded-xl bg-navy-100 p-1">
            {[{ id: 'all', name: 'Tümü' }, ...classes].map((c) => (
              <button
                key={c.id}
                onClick={() => setClassId(c.id as ClassId | 'all')}
                className={`px-3 h-8 rounded-lg text-xs font-semibold ${classId === c.id ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="risk">Önce ilgi bekleyenler</option>
            <option value="net">Nete göre</option>
            <option value="name">İsme göre</option>
          </select>
        </div>

        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-y border-navy-100 bg-navy-50/60 text-left text-xs text-navy-500">
                <th className="px-5 sm:px-6 py-2.5 font-medium">Öğrenci</th>
                <th className="px-3 py-2.5 font-medium">Son net</th>
                <th className="px-3 py-2.5 font-medium">Ödev</th>
                <th className="px-3 py-2.5 font-medium">Devam</th>
                <th className="px-3 py-2.5 font-medium">Son çalışma</th>
                <th className="px-3 py-2.5 font-medium">Durum</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rows.map(({ s, reasons }) => (
                <tr key={s.id} className="hover:bg-navy-50/50">
                  <td className="px-5 sm:px-6 py-3">
                    <StudentLink s={s} sub={<p className="text-xs text-navy-400">{s.cls.name} · {s.studentNo}</p>} />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-navy-900">
                      {s.lastNet} <span className="text-xs font-normal text-navy-400">/ {s.cls.netMax}</span>
                    </p>
                    <NetChange value={s.netChange} />
                  </td>
                  <td className="px-3 py-3">
                    <p className={`font-semibold ${s.homeworkDone / s.homeworkTotal < 0.7 ? 'text-error-600' : 'text-navy-800'}`}>
                      {s.homeworkDone}/{s.homeworkTotal}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className={`font-semibold ${s.attendanceRate < 85 ? 'text-warning-700' : 'text-navy-800'}`}>%{s.attendanceRate}</p>
                  </td>
                  <td className="px-3 py-3 text-navy-600">
                    {s.lastActiveDaysAgo === 0 ? 'Bugün' : s.lastActiveDaysAgo === 1 ? 'Dün' : `${s.lastActiveDaysAgo} gün önce`}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {reasons.length ? (
                        reasons.slice(0, 2).map((r) => <RiskChip key={r.label} level={r.level} label={r.label} />)
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> İyi gidiyor
                        </span>
                      )}
                      {reasons.length > 2 && <span className="text-[11px] text-navy-400">+{reasons.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right pr-5 sm:pr-6">
                    <Link to={`/teacher/students/${s.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 hover:bg-white" aria-label="Detay">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </TeacherLayout>
  );
}
