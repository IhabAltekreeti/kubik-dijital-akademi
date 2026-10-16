import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  BookOpenCheck,
  Bot,
  Brain,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Presentation,
  Repeat,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';
import { loginAsDemo, getDashboardPath } from '@/services/authService';
import type { UserRole } from '@/types';

function useDemoLogin() {
  const navigate = useNavigate();
  return (role: UserRole) => {
    const result = loginAsDemo(role);
    if (result.success && result.user) {
      navigate(getDashboardPath(result.user.role ?? role));
    } else {
      navigate('/login');
    }
  };
}

function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-14">
      <span
        className={`inline-block text-xs font-semibold uppercase tracking-[0.18em] mb-3 ${
          dark ? 'text-brand-300' : 'text-brand-600'
        }`}
      >
        {eyebrow}
      </span>
      <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg leading-relaxed ${dark ? 'text-navy-200' : 'text-navy-500'}`}>{description}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

function HeroMockup() {
  const bars = [
    { label: 'D1', value: 52 },
    { label: 'D2', value: 58 },
    { label: 'D3', value: 61 },
    { label: 'D4', value: 67 },
    { label: 'D5', value: 74 },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-brand-500/20 blur-3xl rounded-full" />
      <div className="relative rounded-2xl bg-white text-navy-900 shadow-2xl ring-1 ring-white/10 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-navy-100 bg-navy-50">
          <span className="h-2.5 w-2.5 rounded-full bg-error-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success-500/70" />
          <span className="ml-3 text-xs text-navy-400">Öğrenci Paneli · Ayşe Y. · 8-A LGS</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Bu hafta', value: '6s 40dk', icon: CalendarCheck, tone: 'text-brand-600 bg-brand-50' },
              { label: 'Başarı', value: '%78', icon: TrendingUp, tone: 'text-success-600 bg-success-50' },
              { label: 'Açık hata', value: '12', icon: XCircle, tone: 'text-error-600 bg-error-50' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-navy-100 p-3">
                <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${s.tone}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="mt-2 text-[11px] text-navy-400">{s.label}</p>
                <p className="text-sm font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-navy-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-navy-700">LGS Deneme Netleri</p>
              <span className="text-[11px] font-medium text-success-600">+22 net ↑</span>
            </div>
            <div className="flex items-end gap-3 h-24">
              {bars.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400"
                    style={{ height: `${b.value}%` }}
                  />
                  <span className="text-[10px] text-navy-400">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-navy-900 text-white p-3.5 flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-brand-200 font-medium">Kübik AI · Öneri</p>
              <p className="text-xs text-navy-100 leading-relaxed mt-0.5">
                Bu hafta <b className="text-white">Hücre Bölünmeleri</b> konusunda 4 hata yaptın. Bugün 15 dakikalık bir
                tekrar planladım.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex absolute -left-8 bottom-10 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl text-navy-900">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50 text-success-600">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold">Veliye rapor gönderildi</p>
          <p className="text-[11px] text-navy-400">Haftalık gelişim özeti</p>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-950" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-3xl" />

      <div className="relative container-page py-20 lg:py-28 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Kübik Dershanesi'nin dijital kampüsü
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight">
            Dershane deneyimi
            <br />
            <span className="bg-gradient-to-r from-brand-300 to-accent-300 bg-clip-text text-transparent">
              sınıfla sınırlı değil.
            </span>
          </h1>
          <p className="mt-6 text-lg text-navy-200 leading-relaxed max-w-xl">
            Kübik Dijital Akademi; öğrenciyi, öğretmeni, veliyi ve yönetimi tek platformda buluşturur. 5–12. sınıf, LGS
            ve YKS hazırlıkta <b className="text-white">yapay zeka destekli</b> kişisel takip.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="#paneller"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-lg shadow-brand-900/40 transition-colors"
            >
              Platformu Keşfet
              <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
            >
              Öğrenci / Veli Girişi
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
            {[
              { k: '5–12', v: 'sınıf seviyesi' },
              { k: 'LGS · YKS', v: 'sınav hazırlığı' },
              { k: '7/24', v: 'AI çalışma asistanı' },
              { k: '4 panel', v: 'tek sistem' },
            ].map((s) => (
              <div key={s.k} className="border-l-2 border-brand-400/60 pl-3">
                <p className="text-base font-bold text-white">{s.k}</p>
                <p className="text-xs text-navy-300">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PANELS                                                              */
/* ------------------------------------------------------------------ */

function PanelsSection() {
  const demoLogin = useDemoLogin();
  const panels: {
    role: UserRole;
    title: string;
    subtitle: string;
    icon: typeof Users;
    color: string;
    features: string[];
  }[] = [
    {
      role: 'student',
      title: 'Öğrenci',
      subtitle: 'Kendi hızında, kendi planıyla',
      icon: GraduationCap,
      color: 'from-brand-500 to-brand-700',
      features: ['Kişisel çalışma planı', 'Otomatik hata defteri', 'Konu bazlı ustalık takibi', 'AI ile ipucu ve konu anlatımı'],
    },
    {
      role: 'teacher',
      title: 'Öğretmen',
      subtitle: 'Sınıfını veriyle tanı',
      icon: Presentation,
      color: 'from-accent-500 to-accent-700',
      features: ['Şube ve öğrenci takibi', 'Ödev ve test atama', 'Sınıfın zayıf konu analizi', 'Deneme sonuçları raporu'],
    },
    {
      role: 'parent',
      title: 'Veli',
      subtitle: 'Çocuğunun gelişimi cebinde',
      icon: Users,
      color: 'from-success-500 to-success-700',
      features: ['Haftalık gelişim raporu', 'Ödev ve çalışma süresi', 'Deneme net takibi', 'Öğretmen notları ve duyurular'],
    },
    {
      role: 'admin',
      title: 'Yönetim',
      subtitle: 'Kurumun tamamı tek ekranda',
      icon: Building2,
      color: 'from-navy-600 to-navy-800',
      features: ['Şube ve kayıt yönetimi', 'Öğretmen ve ders programı', 'Kurum geneli başarı raporları', 'Toplu duyuru ve bildirim'],
    },
  ];

  return (
    <section id="paneller" className="py-20 lg:py-28 bg-white scroll-mt-16">
      <div className="container-page">
        <SectionHeading
          eyebrow="Tek platform · Dört bakış açısı"
          title="Herkes ihtiyacı olanı görür"
          description="Öğrencinin çözdüğü her soru; öğretmenin analizine, velinin raporuna ve yönetimin kararlarına otomatik olarak yansır."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {panels.map((p) => (
            <div
              key={p.role}
              className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md`}>
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-navy-900">{p.title} Paneli</h3>
              <p className="text-sm text-navy-500">{p.subtitle}</p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-700">
                    <CheckCircle2 className="h-4 w-4 text-success-600 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => demoLogin(p.role)}
                className="mt-6 inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-navy-200 text-sm font-semibold text-navy-800 group-hover:bg-navy-900 group-hover:text-white group-hover:border-navy-900 transition-colors"
              >
                Demo olarak incele
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* AI                                                                  */
/* ------------------------------------------------------------------ */

function AISection() {
  return (
    <section id="yapay-zeka" className="py-20 lg:py-28 bg-navy-950 text-white relative overflow-hidden scroll-mt-16">
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl" />
      <div className="relative container-page grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] mb-3 text-brand-300">
            Yapay zeka destekli öğrenme
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Cevabı vermez,
            <br />
            <span className="text-brand-300">düşünmeyi öğretir.</span>
          </h2>
          <p className="mt-5 text-lg text-navy-200 leading-relaxed">
            Kübik AI, öğrencinin sınıf seviyesine göre konuşur. Takıldığı soruda önce ipucu verir, gerekirse adım adım
            çözer, ardından aynı kavramdan yeni bir soru üretir.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              { icon: Lightbulb, t: 'İpucu modu', d: 'Çözümü vermeden yönlendirir' },
              { icon: BookOpenCheck, t: 'Adım adım çözüm', d: 'Neden doğru, neden yanlış' },
              { icon: Repeat, t: 'Benzer soru üretimi', d: 'Kavramı pekiştirir' },
              { icon: Target, t: 'Kişisel öneri', d: 'Zayıf konuya göre plan' },
            ].map((f) => (
              <div key={f.t} className="flex gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
                <f.icon className="h-5 w-5 text-brand-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{f.t}</p>
                  <p className="text-xs text-navy-300 mt-0.5">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white text-navy-900 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-navy-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Kübik AI Asistan</p>
              <p className="text-[11px] text-success-600">● Çevrimiçi · Biyoloji · 10. sınıf</p>
            </div>
          </div>
          <div className="p-5 space-y-4 bg-navy-50/60">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 text-white px-4 py-2.5 text-sm">
                Mitoz ile mayoz arasındaki farkı hep karıştırıyorum 😩
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-navy-100 px-4 py-3 text-sm text-navy-700 leading-relaxed">
                Çok normal! Şöyle düşün: <b>Mitoz</b> vücudu <i>büyütür ve onarır</i>, <b>mayoz</b> ise <i>üreme hücresi</i>{' '}
                yapar. 🔍 İpucu: Sonuçta oluşan hücrelerin kromozom sayısına bak. Mitozda ne olur sence?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 text-white px-4 py-2.5 text-sm">
                Mitozda kromozom sayısı aynı kalıyor mu?
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-navy-100 px-4 py-3 text-sm text-navy-700">
                Aynen öyle! ✅ Hadi pekiştirelim, sana benzer bir soru hazırladım →
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-navy-100">
            <div className="flex-1 h-10 rounded-xl bg-navy-50 px-4 flex items-center text-sm text-navy-400">
              Sorunu yaz...
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Send className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* LEARNING LOOP                                                       */
/* ------------------------------------------------------------------ */

function LoopSection() {
  const steps = [
    { icon: BookOpen, t: 'Soru çöz', d: 'Ders ve konu bazlı testler, ödevler ve denemeler.' },
    { icon: XCircle, t: 'Hatanı anla', d: 'Her yanlış, açıklamasıyla birlikte hata defterine düşer.' },
    { icon: Brain, t: 'AI ile pekiştir', d: 'İpucu, konu özeti ve benzer sorularla eksik kapanır.' },
    { icon: BarChart3, t: 'Gelişimini gör', d: 'Konu ustalığı ve deneme netleri grafikle izlenir.' },
  ];
  return (
    <section id="platform" className="py-20 lg:py-28 bg-navy-50 scroll-mt-16">
      <div className="container-page">
        <SectionHeading
          eyebrow="Nasıl çalışır"
          title="Her hata, bir sonraki netin"
          description="Kübik, ezber yerine kalıcı öğrenmeyi hedefleyen dört adımlı bir döngüyle çalışır."
        />
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />
          {steps.map((s, i) => (
            <div key={s.t} className="relative text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-elevated ring-4 ring-navy-50">
                <s.icon className="h-7 w-7 text-brand-600" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-base font-bold text-navy-900">{s.t}</h3>
              <p className="mt-2 text-sm text-navy-500 leading-relaxed max-w-[15rem] mx-auto">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PROGRAMS                                                            */
/* ------------------------------------------------------------------ */

function ProgramsSection() {
  const items = [
    {
      tag: '5 · 6 · 7. sınıf',
      title: 'Ortaokul Destek',
      d: 'Okul müfredatına paralel konu tekrarı, yazılı hazırlığı ve sağlam temel.',
      chips: ['Matematik', 'Fen', 'Türkçe', 'İngilizce'],
    },
    {
      tag: '8. sınıf',
      title: 'LGS Hazırlık',
      d: 'Yeni nesil sorular, düzenli denemeler ve net odaklı kişisel çalışma planı.',
      chips: ['Sayısal', 'Sözel', 'Deneme analizi'],
      highlight: true,
    },
    {
      tag: '9 · 10 · 11. sınıf',
      title: 'Lise Destek',
      d: 'Okul başarısını desteklerken TYT temelini erkenden atan program.',
      chips: ['Fizik', 'Kimya', 'Biyoloji', 'Edebiyat'],
    },
    {
      tag: '12. sınıf & mezun',
      title: 'YKS Hazırlık',
      d: 'TYT–AYT konu takibi, deneme netleri ve hedef bölüme göre strateji.',
      chips: ['TYT', 'AYT', 'Hedef takibi'],
      highlight: true,
    },
  ];
  return (
    <section id="programlar" className="py-20 lg:py-28 bg-white scroll-mt-16">
      <div className="container-page">
        <SectionHeading
          eyebrow="Programlar"
          title="5. sınıftan üniversiteye kadar"
          description="Her seviyeye özel içerik; dershanedeki derslerle birebir uyumlu."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <div
              key={p.title}
              className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                p.highlight
                  ? 'bg-navy-900 text-white border-navy-900 shadow-elevated'
                  : 'bg-white text-navy-900 border-navy-100 shadow-card hover:shadow-elevated'
              }`}
            >
              {p.highlight && (
                <span className="absolute top-4 right-4 rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-semibold">
                  Sınav yılı
                </span>
              )}
              <p className={`text-xs font-semibold ${p.highlight ? 'text-brand-300' : 'text-brand-600'}`}>{p.tag}</p>
              <h3 className="mt-2 text-xl font-bold">{p.title}</h3>
              <p className={`mt-3 text-sm leading-relaxed ${p.highlight ? 'text-navy-200' : 'text-navy-500'}`}>{p.d}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.chips.map((c) => (
                  <span
                    key={c}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      p.highlight ? 'bg-white/10 text-navy-100' : 'bg-navy-50 text-navy-600'
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* WHY                                                                 */
/* ------------------------------------------------------------------ */

function WhySection() {
  const items = [
    { icon: ClipboardList, t: 'Kâğıt yerine veri', d: 'Ödev, deneme ve devam bilgisi tek yerde; Excel ve kâğıt takibine son.' },
    { icon: MessageCircle, t: 'Mutlu veli', d: 'Veli, dershaneyi aramadan çocuğunun durumunu her an görebilir.' },
    { icon: Target, t: 'Kişiye özel takip', d: 'Her öğrencinin eksik konusu otomatik tespit edilir, öğretmene raporlanır.' },
    { icon: ShieldCheck, t: 'Kuruma özel', d: 'Kübik markasıyla, yalnızca Kübik öğrencilerine açık kapalı bir sistem.' },
  ];
  return (
    <section className="py-20 lg:py-28 bg-navy-50">
      <div className="container-page">
        <SectionHeading
          eyebrow="Neden Kübik Dijital?"
          title="Sınıfta başlayan, evde devam eden eğitim"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((i) => (
            <div key={i.t} className="rounded-2xl bg-white p-6 border border-navy-100 shadow-card">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <i.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-navy-900">{i.t}</h3>
              <p className="mt-2 text-sm text-navy-500 leading-relaxed">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const faq = [
  {
    q: 'Kübik Dijital Akademi nedir?',
    a: "Kübik Dershanesi'nin öğrencilerine, velilerine ve öğretmenlerine özel dijital eğitim platformudur. Derste öğrenilenleri evde soru çözümü, hata takibi ve yapay zeka desteğiyle pekiştirmeyi sağlar.",
  },
  {
    q: 'Kimler kullanabilir?',
    a: 'Platform Kübik öğrencilerine ve velilerine özeldir. Giriş bilgileri kayıt sırasında dershanemiz tarafından verilir.',
  },
  {
    q: 'Veliler neleri görebilir?',
    a: 'Veliler; çocuklarının haftalık çalışma süresini, ödev durumunu, deneme netlerini, güçlü ve zayıf konularını ve öğretmen notlarını görebilir.',
  },
  {
    q: 'Yapay zeka cevapları direkt mi veriyor?',
    a: 'Hayır. Kübik AI önce ipucu verir ve öğrenciyi düşünmeye yönlendirir. Öğrenci isterse çözümü adım adım açıklar. Amaç ezber değil, kalıcı öğrenmedir.',
  },
  {
    q: 'Hangi sınıflar ve sınavlar destekleniyor?',
    a: '5, 6 ve 7. sınıf ortaokul desteği, 8. sınıf LGS hazırlığı, 9–11. sınıf lise desteği ile 12. sınıf ve mezunlar için YKS (TYT–AYT) hazırlığı.',
  },
  {
    q: 'Öğrenci verileri güvende mi?',
    a: 'Öğrenci verileri yalnızca öğrencinin kendisi, velisi, öğretmenleri ve dershane yönetimi tarafından görüntülenebilir; KVKK kapsamında korunur.',
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="sss" className="py-20 lg:py-28 bg-white scroll-mt-16">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="Sıkça sorulan sorular" title="Merak edilenler" />
        <div className="divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white shadow-card">
          {faq.map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-sm sm:text-base font-semibold text-navy-900">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-navy-400 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 -mt-1 text-sm text-navy-500 leading-relaxed animate-slide-down">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA                                                                 */
/* ------------------------------------------------------------------ */

function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-navy-900 px-8 py-14 sm:px-14 text-white">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Kübik ailesine dijital dünyada da katıl.</h2>
              <p className="mt-3 text-brand-100 text-lg max-w-xl">
                Öğrenci, veli ve öğretmen girişleri için hesabınla oturum aç ya da panelleri demo olarak incele.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-navy-900 font-semibold hover:bg-brand-50 transition-colors"
              >
                Giriş Yap
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#paneller"
                className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-white/30 font-semibold hover:bg-white/10 transition-colors"
              >
                Demoyu İncele
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <PublicLayout>
      <HeroSection />
      <PanelsSection />
      <AISection />
      <LoopSection />
      <ProgramsSection />
      <WhySection />
      <FAQSection />
      <CTASection />
    </PublicLayout>
  );
}
