import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Sparkles,
  StickyNote,
  Target,
  Trophy,
  UserPlus,
  UserX,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AdminLayout, { Bar, LiveBadge } from './AdminLayout';
import { AIText, KpiCard, SectionTitle, relTime } from '@/pages/teacher/shared';
import {
  generateAdminReport,
  getAbsentToday,
  getActivity,
  getOverview,
  getRiskRows,
  getTeacherRows,
  num,
  tl,
  type ActivityKind,
  type AdminAIResult,
} from '@/services/adminService';
import { institution } from '@/data/adminDemo';

const activityIcon: Record<ActivityKind, LucideIcon> = {
  payment: CreditCard,
  assignment: ClipboardList,
  attendance: CalendarCheck,
  exam: GraduationCap,
  counseling: Users,
  message: MessageSquare,
  note: StickyNote,
  lead: UserPlus,
  announcement: Megaphone,
  submission: Trophy,
};

function AIReport() {
  const [result, setResult] = useState<AdminAIResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const [r] = await Promise.all([generateAdminReport(), new Promise((res) => setTimeout(res, 900))]);
    setResult(r);
    setLoading(false);
  }

  return (
    <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/40">
      <SectionTitle
        icon={Sparkles}
        title="Kübik AI · Haftalık Yönetim Raporu"
        subtitle="Akademik, finans, öğretmen ve ön kayıt verilerinden tek sayfalık özet"
        right={
          result ? (
            <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 border ${result.source === 'gemini' ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-navy-50 text-navy-500 border-navy-100'}`}>
              {result.source === 'gemini' ? 'Gemini' : 'Demo verisinden hazırlandı'}
            </span>
          ) : null
        }
      />
      {!result && !loading && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-dashed border-brand-200 bg-white p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <p className="flex-1 text-sm text-navy-600">Bu haftanın tablosunu, dikkat edilmesi gerekenleri ve yapılacakları Kübik AI hazırlasın.</p>
          <Button onClick={run}>
            <FileText className="h-4 w-4" />
            Raporu oluştur
          </Button>
        </div>
      )}
      {loading && (
        <div className="space-y-2.5 animate-pulse">
          {[90, 75, 82, 60, 70].map((w, i) => (
            <div key={i} className="h-3 rounded bg-navy-100" style={{ width: `${w}%` }} />
          ))}
          <p className="pt-2 text-xs text-navy-400">Kübik AI veriyi inceliyor…</p>
        </div>
      )}
      {result && !loading && (
        <>
          <AIText text={result.text} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={run}>
              <RefreshCw className="h-3.5 w-3.5" />
              Yeniden oluştur
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

export default function AdminHomePage() {
  const o = getOverview();
  const risk = getRiskRows();
  const absent = getAbsentToday();
  const activity = getActivity(9);
  const teachers = getTeacherRows();
  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <AdminLayout title="Genel Bakış" description={`${institution.name} · ${institution.term}`}>
      {/* Karşılama */}
      <div className="rounded-2xl bg-navy-900 text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/20" />
        <p className="text-sm text-navy-300 capitalize">{today}</p>
        <h2 className="mt-1 text-2xl font-bold">Hoş geldiniz Ali Hoca</h2>
        <p className="mt-2 text-sm text-navy-200 max-w-2xl">
          Kurumda <b className="text-white">{o.students}</b> öğrenci var; geçen yıla göre <b className="text-white">%{num(o.growthPct)}</b> büyüme. Bugün derse katılım{' '}
          <b className="text-white">{o.todayPresent}/{o.todayExpected}</b>, {o.monthName} tahsilatı <b className="text-white">%{o.monthRate}</b>.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={Users} tone="bg-brand-50 text-brand-600" label="Kayıtlı öğrenci" value={o.students} sub={`Kapasite ${o.capacity} · doluluk %${o.occupancy}`} />
        <KpiCard icon={Target} tone="bg-accent-50 text-accent-600" label="Kayıt hedefi" value={`${o.students}/${o.target}`} sub={`Hedefe ${o.toTarget} öğrenci · geçen yıl ${o.lastYear}`} />
        <KpiCard icon={CalendarCheck} tone="bg-success-50 text-success-600" label="Bugün derste" value={`${o.todayPresent}/${o.todayExpected}`} sub={`${o.todayAbsent} devamsız`} />
        <KpiCard icon={Wallet} tone="bg-warning-50 text-warning-600" label={`${o.monthName} tahsilatı`} value={`%${o.monthRate}`} sub={`${tl(o.monthCollected)} / ${tl(o.monthExpected)}`} />
        <KpiCard icon={UserPlus} tone="bg-navy-100 text-navy-700" label="Aktif aday" value={o.activeLeads} sub={`${o.newLeads} yeni başvuru aranmayı bekliyor`} />
      </div>

      {/* Kayıt hedefi */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
          <div>
            <p className="text-sm font-semibold text-navy-900">{institution.term} kayıt hedefi</p>
            <p className="text-xs text-navy-400">Geçen yıl {o.lastYear} · hedef {o.target} · kapasite {o.capacity}</p>
          </div>
          <Link to="/admin/enrollment" className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
            Ön kayıt takibi <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="relative h-4 rounded-full bg-navy-100 overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-navy-300" style={{ width: `${(o.lastYear / o.capacity) * 100}%` }} />
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-600 to-brand-400 opacity-90" style={{ width: `${(o.students / o.capacity) * 100}%` }} />
          <div className="absolute inset-y-0 w-0.5 bg-navy-900" style={{ left: `${(o.target / o.capacity) * 100}%` }} title="Hedef" />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-navy-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" />Bu yıl {o.students}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-navy-300" />Geçen yıl {o.lastYear}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-0.5 bg-navy-900" />Hedef {o.target}</span>
        </div>
      </Card>

      <AIReport />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Risk */}
        <Card className="lg:col-span-2">
          <SectionTitle
            icon={AlertTriangle}
            title="Dikkat gereken öğrenciler"
            subtitle={`${o.riskCount} öğrenci · ${o.highRiskCount} yüksek risk`}
            right={
              <Link to="/admin/academics#risk" className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                Tümü <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="divide-y divide-navy-100">
            {risk.slice(0, 6).map((r) => (
              <div key={r.name} className="py-2.5 flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${r.level === 'high' ? 'bg-error-500' : 'bg-warning-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                    {r.name} <span className="text-xs font-normal text-navy-400">{r.className}</span>
                    {r.live && <LiveBadge />}
                  </p>
                  <p className="text-xs text-navy-500 truncate">{r.reasons.join(' · ')}</p>
                </div>
                <span className="text-[11px] text-navy-400 shrink-0">{r.owner}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bugün gelmeyenler */}
        <Card>
          <SectionTitle icon={UserX} title="Bugün gelmeyenler" subtitle={`${o.todayAbsent} devamsız · ${absent.filter((a) => a.status === 'gec').length} geç`} />
          <div className="space-y-2.5">
            {absent.map((a) => (
              <div key={a.name} className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${
                    a.status === 'habersiz' ? 'bg-error-50 text-error-700 border-error-100' : a.status === 'izinli' ? 'bg-navy-50 text-navy-600 border-navy-100' : 'bg-warning-50 text-warning-700 border-warning-100'
                  }`}
                >
                  {a.status === 'habersiz' ? 'Habersiz' : a.status === 'izinli' ? 'İzinli' : 'Geç'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy-900">
                    {a.name} <span className="text-xs text-navy-400">{a.className}</span>
                  </p>
                  <p className="text-[11px] text-navy-400">{a.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Canlı akış */}
        <Card className="lg:col-span-2">
          <SectionTitle icon={Activity} title="Canlı akış" subtitle="Öğretmen, veli ve öğrenci panellerinden gelen son hareketler" />
          <div className="space-y-3">
            {activity.map((a) => {
              const Icon = activityIcon[a.kind];
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.live ? 'bg-success-50 text-success-600' : 'bg-navy-50 text-navy-500'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-navy-800">{a.text}</p>
                    <p className="text-[11px] text-navy-400 flex items-center gap-2">
                      {relTime(a.at)} {a.live && <LiveBadge title="Bu demoda panellerde yapılan işlem" />}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Öğretmen özeti */}
        <Card>
          <SectionTitle
            icon={Trophy}
            title="Öğretmen performansı"
            subtitle="Bileşik puan · ilk 5"
            right={
              <Link to="/admin/teachers" className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                Tablo <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="space-y-3">
            {teachers.slice(0, 5).map((t) => (
              <div key={t.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-navy-900 flex items-center gap-1.5">
                    <span className="w-4 text-xs text-navy-400">{t.rank}.</span>
                    {t.name}
                    {t.live && <LiveBadge />}
                  </span>
                  <span className="font-bold text-navy-900">{num(t.composite)}</span>
                </div>
                <div className="mt-1 pl-5">
                  <Bar pct={t.composite} tone={t.rank === 1 ? 'bg-success-500' : 'bg-brand-500'} h="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
