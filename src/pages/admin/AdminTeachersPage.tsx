import { Crown, HeartHandshake, Info, MessageSquare, Trophy } from 'lucide-react';
import Card from '@/components/ui/Card';
import AdminLayout, { Bar, DemoNote, LiveBadge } from './AdminLayout';
import { Avatar, SectionTitle } from '@/pages/teacher/shared';
import { getCounselor, getTeacherRows, num } from '@/services/adminService';
import { scoring } from '@/data/adminDemo';

const cols = [
  { key: 'net', label: 'Net artışı', w: scoring.weights.net },
  { key: 'satisfaction', label: 'Veli memnuniyeti', w: scoring.weights.satisfaction },
  { key: 'homework', label: 'Ödev', w: scoring.weights.homework },
  { key: 'attendance', label: 'Devam', w: scoring.weights.attendance },
  { key: 'reply', label: 'Dönüş hızı', w: scoring.weights.reply },
] as const;

function cell(v: number) {
  const tone = v >= 85 ? 'bg-success-50 text-success-700' : v >= 70 ? 'bg-brand-50 text-brand-700' : v >= 55 ? 'bg-warning-50 text-warning-700' : 'bg-error-50 text-error-700';
  return <span className={`inline-flex min-w-[40px] justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${tone}`}>{v}</span>;
}

export default function AdminTeachersPage() {
  const rows = getTeacherRows();
  const { teacher: counselor, stats } = getCounselor();
  const top = rows[0];

  return (
    <AdminLayout title="Öğretmen Performansı" description="Bileşik puan: net artışı, veli memnuniyeti, ödev, devam ve veliye dönüş hızı">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-white to-success-50/50 border-success-100">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-500 text-white">
              <Crown className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-navy-400">Dönemin lideri</p>
              <p className="text-xl font-bold text-navy-900">{top.name}</p>
              <p className="text-sm text-navy-500">
                {top.branch} · bileşik puan <b className="text-navy-900">{num(top.composite)}</b> · net artışı %{num(top.netGainPct)} · veli memnuniyeti {num(top.satisfaction)}/5
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Info} title="Puan nasıl hesaplanıyor?" />
          <ul className="space-y-1 text-xs text-navy-600">
            {cols.map((c) => (
              <li key={c.key} className="flex justify-between">
                <span>{c.label}</span>
                <span className="font-semibold text-navy-900">%{Math.round(c.w * 100)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-navy-400">
            Net: her %1 artış {scoring.netPointsPerPct} puan. Dönüş: {scoring.replyBestHours} saat ve altı 100, {scoring.replyWorstHours} saat ve üstü 0.
          </p>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={Trophy} title="Sıralama" subtitle={`${rows.length} branş öğretmeni · her sütun 0–100`} />
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-navy-400 border-b border-navy-100">
                <th className="px-5 sm:px-6 py-2 font-medium w-10">#</th>
                <th className="py-2 font-medium">Öğretmen</th>
                {cols.map((c) => (
                  <th key={c.key} className="py-2 font-medium text-center">
                    {c.label}
                    <span className="block normal-case text-navy-300">%{Math.round(c.w * 100)}</span>
                  </th>
                ))}
                <th className="py-2 pr-5 sm:pr-6 font-medium w-40">Bileşik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rows.map((t) => (
                <tr key={t.id} className={t.live ? 'bg-brand-50/40' : 'hover:bg-navy-50/60'}>
                  <td className="px-5 sm:px-6 py-3 font-bold text-navy-400">{t.rank}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} tone={t.live ? 'brand' : 'navy'} />
                      <div className="min-w-0">
                        <p className="font-semibold text-navy-900 flex items-center gap-1.5">
                          {t.name} {t.live && <LiveBadge title="Net, ödev ve devam öğretmen panelinden canlı geliyor" />}
                        </p>
                        <p className="text-[11px] text-navy-400 truncate">
                          {t.branch} · {t.classes.join(', ')} · {t.weeklyHours} sa/hafta
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center" title={`Net artışı %${num(t.netGainPct)}`}>
                    {cell(t.scores.net)}
                    <span className="block text-[10px] text-navy-400">%{num(t.netGainPct)}</span>
                  </td>
                  <td className="py-3 text-center" title={`${t.surveyCount} veli anketi`}>
                    {cell(t.scores.satisfaction)}
                    <span className="block text-[10px] text-navy-400">{num(t.satisfaction)}/5 · {t.surveyCount} anket</span>
                  </td>
                  <td className="py-3 text-center">
                    {cell(t.scores.homework)}
                    <span className="block text-[10px] text-navy-400">%{t.homeworkRate} teslim</span>
                  </td>
                  <td className="py-3 text-center">
                    {cell(t.scores.attendance)}
                    <span className="block text-[10px] text-navy-400">%{t.attendanceRate}</span>
                  </td>
                  <td className="py-3 text-center">
                    {cell(t.scores.reply)}
                    <span className="block text-[10px] text-navy-400">
                      ort. {num(t.replyHours)} sa{t.pendingMessages ? ` · ${t.pendingMessages} bekleyen` : ''}
                    </span>
                  </td>
                  <td className="py-3 pr-5 sm:pr-6">
                    <div className="flex items-center gap-2">
                      <Bar pct={t.composite} tone={t.rank === 1 ? 'bg-success-500' : t.composite >= 70 ? 'bg-brand-500' : 'bg-warning-500'} />
                      <span className="w-10 text-right font-bold text-navy-900">{num(t.composite)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle icon={HeartHandshake} title={`Rehberlik · ${counselor.name}`} subtitle="Derse girmediği için sıralamaya dahil değil" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-navy-50 p-3">
              <p className="text-xl font-bold text-navy-900">{stats.studentMeetings}</p>
              <p className="text-[11px] text-navy-500">öğrenci görüşmesi</p>
            </div>
            <div className="rounded-xl bg-navy-50 p-3">
              <p className="text-xl font-bold text-navy-900">{stats.parentMeetings}</p>
              <p className="text-[11px] text-navy-500">veli görüşmesi</p>
            </div>
            <div className="rounded-xl bg-navy-50 p-3">
              <p className="text-xl font-bold text-navy-900">{num(counselor.satisfaction)}/5</p>
              <p className="text-[11px] text-navy-500">memnuniyet</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-navy-500">Bu hafta {stats.plannedThisWeek} görüşme planlı.</p>
        </Card>
        <Card>
          <SectionTitle icon={MessageSquare} title="Veliye dönüş süresi" subtitle="Ortalama cevap süresi (saat)" />
          <div className="space-y-2">
            {[...rows].sort((a, b) => a.replyHours - b.replyHours).map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-xs">
                <span className="w-32 truncate text-navy-700">{t.name}</span>
                <Bar pct={(t.replyHours / scoring.replyWorstHours) * 100} tone={t.replyHours <= 6 ? 'bg-success-500' : t.replyHours <= 14 ? 'bg-warning-500' : 'bg-error-500'} h="h-1.5" />
                <span className="w-12 text-right font-semibold text-navy-900">{num(t.replyHours)} sa</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <DemoNote>Ali Hoca'nın net, ödev ve devam verileri öğretmen panelinden canlı hesaplanır; diğer öğretmenler ve anket sonuçları demo verisidir (src/data/adminDemo.ts).</DemoNote>
    </AdminLayout>
  );
}
