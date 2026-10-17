import { useState } from 'react';
import { AlertCircle, BellRing, CheckCircle2, CircleDollarSign, Receipt, TrendingUp, Wallet } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AdminLayout, { Bar, DemoNote } from './AdminLayout';
import { KpiCard, SectionTitle } from '@/pages/teacher/shared';
import { getFinance, markReminded, tl } from '@/services/adminService';
import { installmentCount, installmentDueDay } from '@/data/adminDemo';

export default function AdminFinancePage() {
  const [, setTick] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sentInfo, setSentInfo] = useState('');
  const f = getFinance();
  const cur = f.months[f.currentIndex];

  function toggle(id: string) {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  }

  function sendReminders() {
    const ids = Array.from(selected);
    markReminded(ids);
    setSentInfo(`${ids.length} aileye ödeme hatırlatma SMS'i gönderildi olarak işaretlendi (demo, gerçek SMS gitmez).`);
    setSelected(new Set());
    setTick((t) => t + 1);
  }

  return (
    <AdminLayout title="Finans" description={`Yıllık ücretler ${installmentCount} taksit · son ödeme her ayın ${installmentDueDay}'u`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Receipt} tone="bg-brand-50 text-brand-600" label="Yıllık sözleşme toplamı" value={tl(f.annualTotal)} sub={`Aylık beklenen ${tl(f.monthlyExpected)}`} />
        <KpiCard icon={CircleDollarSign} tone="bg-success-50 text-success-600" label="Bugüne kadar tahsilat" value={tl(f.collectedToDate)} sub={`Beklenen ${tl(f.expectedToDate)}`} />
        <KpiCard icon={AlertCircle} tone="bg-error-50 text-error-600" label="Geciken" value={tl(f.overdueTotal)} sub={`${f.overdueFamilyCount} aile`} />
        <KpiCard icon={Wallet} tone="bg-warning-50 text-warning-600" label={`${cur.name} tahsilatı`} value={`%${cur.rate}`} sub={`${tl(cur.collected)} · geçen yıl %${cur.lastYearRate}`} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <SectionTitle icon={TrendingUp} title="Aylık tahsilat" subtitle="Beklenen taksit tutarına göre tahsil oranı" />
          <div className="flex items-end gap-2 h-48 border-b border-navy-100">
            {f.months.map((m) => (
              <div key={m.name} className="flex-1 h-full flex flex-col items-center justify-end gap-1" title={`${m.name}: ${m.rate !== null ? `%${m.rate} · ${tl(m.collected)}` : `beklenen ${tl(m.expected)}`}`}>
                {m.rate !== null ? (
                  <>
                    <span className={`text-[11px] font-semibold ${m.state === 'current' ? 'text-brand-700' : 'text-navy-600'}`}>%{m.rate}</span>
                    <div className="w-full max-w-[40px] flex-1 flex items-end">
                      <div className={`w-full rounded-t-lg ${m.state === 'current' ? 'bg-gradient-to-t from-brand-600 to-brand-400' : 'bg-success-500'}`} style={{ height: `${m.rate}%` }} />
                    </div>
                  </>
                ) : (
                  <div className="w-full max-w-[40px] flex-1 flex items-end">
                    <div className="w-full rounded-t-lg border border-dashed border-navy-200 bg-navy-50" style={{ height: '100%' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-1.5">
            {f.months.map((m) => (
              <span key={m.name} className="flex-1 text-center text-[10px] text-navy-400">{m.name.slice(0, 3)}</span>
            ))}
          </div>
          <p className="mt-3 text-xs text-navy-500">
            Kalan sözleşme alacağı: <b className="text-navy-900">{tl(f.remainingTotal)}</b> ({f.months.filter((m) => m.state === 'future').length} taksit ayı)
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle icon={Receipt} title="Ücret tablosu" subtitle="Öğrenci × yıllık ücret" />
          <div className="divide-y divide-navy-100">
            {f.feeRows.map((r) => (
              <div key={r.level} className="py-2.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-navy-900">{r.label}</span>
                  <span className="font-bold text-navy-900">{tl(r.total)}</span>
                </div>
                <p className="text-[11px] text-navy-400">
                  {r.students} öğrenci × {tl(r.fee)} · taksit {tl(r.installment)}
                </p>
                <div className="mt-1.5">
                  <Bar pct={(r.total / f.annualTotal) * 100} h="h-1.5" />
                </div>
              </div>
            ))}
            <div className="pt-2.5 flex justify-between text-sm">
              <span className="font-semibold text-navy-900">Toplam</span>
              <span className="font-bold text-navy-900">{tl(f.annualTotal)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle
          icon={AlertCircle}
          title="Geciken ödemeler"
          subtitle={`En uzun gecikenler · toplam ${f.overdueFamilyCount} aile`}
          right={
            <Button size="sm" disabled={!selected.size} onClick={sendReminders}>
              <BellRing className="h-3.5 w-3.5" />
              Hatırlatma SMS'i ({selected.size})
            </Button>
          }
        />
        {sentInfo && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-success-50 border border-success-100 px-3 py-2 text-xs text-success-700">
            <CheckCircle2 className="h-4 w-4" />
            {sentInfo}
          </div>
        )}
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-navy-400 border-b border-navy-100">
                <th className="px-5 sm:px-6 py-2 w-8" />
                <th className="py-2 font-medium">Veli / öğrenci</th>
                <th className="py-2 font-medium">Taksit</th>
                <th className="py-2 font-medium">Tutar</th>
                <th className="py-2 font-medium">Gecikme</th>
                <th className="py-2 pr-5 sm:pr-6 font-medium">Son durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {f.overdue.map((o) => (
                <tr key={o.id} className="hover:bg-navy-50/60">
                  <td className="px-5 sm:px-6 py-2.5">
                    <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} className="h-4 w-4 rounded border-navy-300 text-brand-600" aria-label={`${o.parentName} seç`} />
                  </td>
                  <td className="py-2.5">
                    <p className="font-semibold text-navy-900">{o.parentName}</p>
                    <p className="text-[11px] text-navy-400">{o.studentName} · {o.className} · {o.phone}</p>
                  </td>
                  <td className="py-2.5 text-navy-700">{o.installments}</td>
                  <td className="py-2.5 font-semibold text-navy-900">{tl(o.amount)}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${o.daysLate > 30 ? 'bg-error-50 text-error-700 border-error-100' : 'bg-warning-50 text-warning-700 border-warning-100'}`}>{o.daysLate} gün</span>
                  </td>
                  <td className="py-2.5 pr-5 sm:pr-6 text-xs text-navy-500">
                    {o.reminded ? <span className="text-success-700 font-medium">Hatırlatma SMS'i gönderildi (demo)</span> : o.lastAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <DemoNote>Tutarlar şube öğrenci sayıları × yıllık ücretlerden hesaplanır; indirim ve burslar dahil değildir. Ücretler ve tahsilat oranları src/data/adminDemo.ts dosyasından değiştirilebilir.</DemoNote>
    </AdminLayout>
  );
}
