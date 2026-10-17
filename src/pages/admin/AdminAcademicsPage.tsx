import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, BarChart3, Building2, Flag } from 'lucide-react';
import Card from '@/components/ui/Card';
import AdminLayout, { Bar, DemoNote, LiveBadge } from './AdminLayout';
import { NetChange, SectionTitle } from '@/pages/teacher/shared';
import { getBranchRows, getLevelSummaries, getRiskRows, num } from '@/services/adminService';
import { levelLabels, metricInfo, turkeyAverages, type Level } from '@/data/adminDemo';

export default function AdminAcademicsPage() {
  const levels = getLevelSummaries();
  const rows = getBranchRows();
  const risk = getRiskRows();
  const location = useLocation();
  useEffect(() => {
    if (location.hash === '#risk') document.getElementById('risk')?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash]);
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high'>('all');
  const shown = rows.filter((r) => level === 'all' || r.level === level);
  const shownRisk = risk.filter((r) => riskFilter === 'all' || r.level === 'high');

  return (
    <AdminLayout title="Akademik Durum" description="Seviye ve şube bazında deneme ortalamaları, devam ve ödev">
      {/* Seviye kartları */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {levels.map((l) => {
          const info = metricInfo[l.metric];
          const diff = l.turkeyAvg !== null ? l.avgLast - l.turkeyAvg : null;
          return (
            <Card key={l.level} padding="sm">
              <p className="text-xs text-navy-400">{l.label}</p>
              <p className="text-[11px] text-navy-400">{l.students} öğrenci · {l.branches} şube</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-2xl font-bold text-navy-900">
                  {l.metric === 'KAZANIM' ? `%${num(l.avgLast)}` : num(l.avgLast)}
                </p>
                <span className="pb-1 text-[11px] text-navy-400">{info.label}{l.metric !== 'KAZANIM' ? ` / ${info.max}` : ''}</span>
              </div>
              <div className="mt-1">
                <NetChange value={Math.round((l.avgLast - l.avgPrev) * 10) / 10} unit={l.metric === 'KAZANIM' ? 'puan' : 'net'} />
                <span className="text-[11px] text-navy-400"> son denemede</span>
              </div>
              {diff !== null ? (
                <div className={`mt-3 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${diff >= 0 ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
                  Türkiye ort. {num(l.turkeyAvg!)} → {diff >= 0 ? '+' : ''}{num(diff)} net {diff >= 0 ? 'üstünde' : 'altında'}
                </div>
              ) : (
                <div className="mt-3 rounded-lg px-2.5 py-1.5 text-[11px] bg-navy-50 text-navy-500">Kurum içi kazanım denemesi</div>
              )}
            </Card>
          );
        })}
      </div>
      <DemoNote>
        Türkiye ortalamaları: {turkeyAverages.map((t) => `${t.exam} ${num(t.avg)}`).join(' · ')} (yayınevi sonuç raporundan girilir; şu an demo değer).
      </DemoNote>

      {/* Şube tablosu */}
      <Card>
        <SectionTitle
          icon={Building2}
          title="Şubeler"
          subtitle={`${rows.length} şube · ${rows.reduce((t, r) => t + r.students, 0)} öğrenci`}
          right={
            <div className="flex flex-wrap gap-1">
              {(['all', 'ara', 'lgs', 'yks', 'mezun'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-medium ${level === l ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}
                >
                  {l === 'all' ? 'Tümü' : levelLabels[l].split(' (')[0]}
                </button>
              ))}
            </div>
          }
        />
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-navy-400 border-b border-navy-100">
                <th className="px-5 sm:px-6 py-2 font-medium">Şube</th>
                <th className="py-2 font-medium">Doluluk</th>
                <th className="py-2 font-medium">Son deneme</th>
                <th className="py-2 font-medium">Değişim</th>
                <th className="py-2 font-medium">Türkiye farkı</th>
                <th className="py-2 font-medium w-32">Devam</th>
                <th className="py-2 pr-5 sm:pr-6 font-medium w-32">Ödev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {shown.map((r) => {
                const info = metricInfo[r.metric];
                const diff = r.turkeyAvg !== null ? r.last - r.turkeyAvg : null;
                return (
                  <tr key={r.id} className="hover:bg-navy-50/60">
                    <td className="px-5 sm:px-6 py-2.5">
                      <p className="font-semibold text-navy-900 flex items-center gap-1.5">
                        {r.name} {r.live && <LiveBadge title="Devam ve ödev Ali Hoca'nın öğretmen panelinden canlı geliyor" />}
                      </p>
                      <p className="text-[11px] text-navy-400">{r.room}</p>
                    </td>
                    <td className="py-2.5 text-navy-700">
                      {r.students}/{r.capacity}
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold text-navy-900">{r.metric === 'KAZANIM' ? `%${num(r.last)}` : num(r.last)}</span>
                      <span className="text-[11px] text-navy-400"> {r.metric === 'KAZANIM' ? 'kazanım' : `${r.metric} / ${info.max}`}</span>
                    </td>
                    <td className="py-2.5">
                      <NetChange value={r.change} unit={r.metric === 'KAZANIM' ? 'puan' : 'net'} />
                    </td>
                    <td className="py-2.5 text-xs">
                      {diff === null ? <span className="text-navy-300">—</span> : <span className={diff >= 0 ? 'text-success-700 font-semibold' : 'text-error-700 font-semibold'}>{diff >= 0 ? '+' : ''}{num(diff)}</span>}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <Bar pct={r.attendance} tone={r.attendance >= 90 ? 'bg-success-500' : r.attendance >= 85 ? 'bg-brand-500' : 'bg-warning-500'} h="h-1.5" />
                        <span className="text-xs text-navy-600 w-9">%{r.attendance}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-5 sm:pr-6">
                      <div className="flex items-center gap-2">
                        <Bar pct={r.homework} tone={r.homework >= 80 ? 'bg-success-500' : r.homework >= 72 ? 'bg-brand-500' : 'bg-warning-500'} h="h-1.5" />
                        <span className="text-xs text-navy-600 w-9">%{r.homework}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Risk listesi */}
      <Card id="risk">
        <SectionTitle
          icon={AlertTriangle}
          title="Risk takibi"
          subtitle="Net düşüşü, devamsızlık, ödev ve çalışma süresine göre otomatik"
          right={
            <div className="flex gap-1">
              {(['all', 'high'] as const).map((f) => (
                <button key={f} onClick={() => setRiskFilter(f)} className={`h-7 px-2.5 rounded-lg text-xs font-medium ${riskFilter === f ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}>
                  {f === 'all' ? `Tümü (${risk.length})` : `Yüksek (${risk.filter((r) => r.level === 'high').length})`}
                </button>
              ))}
            </div>
          }
        />
        <div className="grid md:grid-cols-2 gap-3">
          {shownRisk.map((r) => (
            <div key={r.name} className={`rounded-xl border p-3.5 ${r.level === 'high' ? 'border-error-100 bg-error-50/40' : 'border-warning-100 bg-warning-50/40'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-navy-900 flex items-center gap-1.5">
                  <Flag className={`h-3.5 w-3.5 ${r.level === 'high' ? 'text-error-600' : 'text-warning-600'}`} />
                  {r.name}
                  {r.live && <LiveBadge />}
                </p>
                <span className="text-[11px] text-navy-500">{r.className}</span>
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {r.reasons.map((x) => (
                  <li key={x} className="rounded-full bg-white border border-navy-100 px-2 py-0.5 text-[11px] text-navy-600">{x}</li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-navy-400">Takip: {r.owner}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="sm" className="flex items-start gap-3">
        <BarChart3 className="h-4 w-4 text-navy-400 mt-0.5 shrink-0" />
        <DemoNote>8-A LGS ve 12-B Sayısal şubelerinin devam, ödev ve risk bilgileri Ali Hoca'nın öğretmen panelinden canlı okunur; diğer şubeler demo verisidir (src/data/adminDemo.ts).</DemoNote>
      </Card>
    </AdminLayout>
  );
}
