import { useState, type FormEvent } from 'react';
import { Filter, PhoneCall, Plus, RotateCcw, Target, UserPlus, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import AdminLayout, { Bar, DemoNote } from './AdminLayout';
import { KpiCard, SectionTitle, relTime } from '@/pages/teacher/shared';
import { addLead, getLeadFunnel, getLeads, getOverview, resetLeads, updateLeadStage } from '@/services/adminService';
import { leadGrades, leadSources, leadStages, type LeadStage } from '@/data/adminDemo';

const stageTone: Record<LeadStage, string> = {
  yeni: 'bg-brand-50 text-brand-700 border-brand-100',
  arandi: 'bg-accent-50 text-accent-700 border-accent-100',
  gorusme: 'bg-warning-50 text-warning-700 border-warning-100',
  deneme: 'bg-warning-100 text-warning-700 border-warning-100',
  kayit: 'bg-success-50 text-success-700 border-success-100',
  kayip: 'bg-navy-50 text-navy-500 border-navy-100',
};

const emptyForm = { studentName: '', parentName: '', phone: '', grade: leadGrades[3], source: leadSources[0], note: '' };

export default function AdminEnrollmentPage() {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const [filter, setFilter] = useState<LeadStage | 'active' | 'all'>('active');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const o = getOverview();
  const funnel = getLeadFunnel();
  const leads = getLeads().filter((l) => (filter === 'all' ? true : filter === 'active' ? l.stage !== 'kayit' && l.stage !== 'kayip' : l.stage === filter));
  const maxStage = Math.max(...funnel.stages.map((s) => s.count), 1);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (form.studentName.trim().length < 2 || form.parentName.trim().length < 2) {
      setError('Öğrenci ve veli adını yazın.');
      return;
    }
    addLead({ ...form, studentName: form.studentName.trim(), parentName: form.parentName.trim(), phone: form.phone.trim() || '—', note: form.note.trim() });
    setForm(emptyForm);
    setError('');
    setShowForm(false);
    setFilter('active');
    refresh();
  }

  function setStage(id: string, stage: LeadStage) {
    updateLeadStage(id, stage);
    refresh();
  }

  return (
    <AdminLayout
      title="Ön Kayıt Takibi"
      description="Aday öğrenciler: başvurudan kayda kadar"
      actions={
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" />
          Yeni aday
        </Button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} tone="bg-brand-50 text-brand-600" label="Kayıtlı öğrenci" value={`${o.students}/${o.target}`} sub={`Hedefe ${o.toTarget} · boş kontenjan ${o.capacity - o.students}`} />
        <KpiCard icon={UserPlus} tone="bg-accent-50 text-accent-600" label="Aktif aday" value={funnel.active} sub={`${o.newLeads} yeni başvuru aranmadı`} />
        <KpiCard icon={Target} tone="bg-success-50 text-success-600" label="Dönüşüm oranı" value={`%${funnel.conversionRate}`} sub={`${funnel.converted} kayıt · ${funnel.lost} kayıp`} />
        <KpiCard icon={PhoneCall} tone="bg-warning-50 text-warning-600" label="Deneme dersi / görüşme" value={funnel.stages.filter((s) => s.id === 'deneme' || s.id === 'gorusme').reduce((t, s) => t + s.count, 0)} sub="Kayda en yakın adaylar" />
      </div>

      {showForm && (
        <Card className="border-brand-100">
          <SectionTitle icon={UserPlus} title="Yeni aday ekle" />
          <form onSubmit={submit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Öğrenci adı" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Örn. Yiğit Aslan" />
            <Input label="Veli adı" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Örn. Canan Aslan" />
            <Input label="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05xx xxx xx xx" />
            <Select label="Sınıf / hedef" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} options={leadGrades.map((g) => ({ value: g, label: g }))} />
            <Select label="Nereden duydu?" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} options={leadSources.map((g) => ({ value: g, label: g }))} />
            <Input label="Not" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="İsteğe bağlı" />
            <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2">
              {error && <p className="mr-auto text-sm text-error-600">{error}</p>}
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Vazgeç</Button>
              <Button type="submit" size="sm">Kaydet</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionTitle icon={Filter} title="Aday hunisi" />
          <div className="space-y-2.5">
            {funnel.stages.map((s) => (
              <button key={s.id} onClick={() => setFilter(s.id)} className="w-full flex items-center gap-3 text-left group">
                <span className="w-28 text-xs text-navy-600 group-hover:text-navy-900">{s.label}</span>
                <div className="flex-1">
                  <Bar pct={(s.count / maxStage) * 100} tone={s.id === 'kayit' ? 'bg-success-500' : s.id === 'kayip' ? 'bg-navy-300' : 'bg-brand-500'} h="h-3" />
                </div>
                <span className="w-6 text-right text-sm font-bold text-navy-900">{s.count}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Target} title="Kaynaklar" subtitle="Aday · kayıt" />
          <div className="space-y-2">
            {funnel.bySource.map((s) => (
              <div key={s.source} className="flex items-center justify-between text-sm">
                <span className="text-navy-700">{s.source}</span>
                <span className="text-navy-900 font-semibold">
                  {s.total} <span className="text-xs font-normal text-success-600">· {s.converted} kayıt</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle
          icon={Users}
          title="Adaylar"
          subtitle={`${leads.length} kayıt gösteriliyor`}
          right={
            <div className="flex flex-wrap gap-1">
              {([['active', 'Aktif'], ['all', 'Tümü'], ...leadStages.map((s) => [s.id, s.label])] as [LeadStage | 'active' | 'all', string][]).map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)} className={`h-7 px-2.5 rounded-lg text-xs font-medium ${filter === id ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}>
                  {label}
                </button>
              ))}
            </div>
          }
        />
        <div className="divide-y divide-navy-100">
          {leads.length === 0 && <p className="py-6 text-center text-sm text-navy-400">Bu aşamada aday yok.</p>}
          {leads.map((l) => (
            <div key={l.id} className="py-3 flex flex-col md:flex-row md:items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy-900 flex flex-wrap items-center gap-2">
                  {l.studentName}
                  <span className="text-xs font-normal text-navy-400">{l.grade}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stageTone[l.stage]}`}>{leadStages.find((s) => s.id === l.stage)?.label}</span>
                </p>
                <p className="text-xs text-navy-500">
                  Veli: {l.parentName} · {l.phone} · {l.source} · {relTime(l.createdAt)}
                </p>
                {l.note && <p className="text-xs text-navy-400 mt-0.5">{l.note}</p>}
              </div>
              <select
                value={l.stage}
                onChange={(e) => setStage(l.id, e.target.value as LeadStage)}
                className="h-9 rounded-lg border border-navy-200 bg-white px-2 text-xs text-navy-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Aşama"
              >
                {leadStages.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <DemoNote>Bir adayı "Kayıt oldu" yaptığınızda kayıtlı öğrenci sayısı ve Genel Bakış anında güncellenir (demo, tarayıcıda saklanır).</DemoNote>
        <Button variant="ghost" size="sm" onClick={() => { resetLeads(); refresh(); }}>
          <RotateCcw className="h-3.5 w-3.5" />
          Demo adaylarını sıfırla
        </Button>
      </div>
    </AdminLayout>
  );
}
