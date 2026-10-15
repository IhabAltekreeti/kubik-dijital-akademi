import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  ChevronDown,
  Target,
  Brain,
  Repeat,
  ListChecks,
} from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { programs, faqItems } from '@/data/programs';
import { getIcon } from '@/components/ui/IconHelper';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />

      <div className="relative container-page py-20 lg:py-28">
        <div className="max-w-3xl">
          <Badge color="navy" className="bg-white/10 text-brand-200 border-white/10 mb-6">
            <Brain className="h-3.5 w-3.5" />
            Öğrenme döngüsü tabanlı çalışma
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Hatalarından öğren, <br className="hidden sm:block" />
            <span className="text-brand-400">adım adım ilerle.</span>
          </h1>
          <p className="mt-6 text-lg text-navy-200 leading-relaxed max-w-2xl">
            Kubik, LGS, YKS ve okul derslerine hazırlanan öğrenciler için tasarlanmış bir öğrenme platformudur.
            Soru çöz, hatalarını incele, eksik konularını tespit et ve ilerlemeni takip et.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Hemen Başla
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                Giriş Yap
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-navy-300">
            Ücretsiz hesap oluştur, hemen çalışmaya başla.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: BookOpen,
      title: 'Soru Çöz',
      description: 'Konu bazlı pratik soruları yanıtla. Her soru, öğrenme döngüsünün başlangıcıdır.',
    },
    {
      icon: XCircle,
      title: 'Hatanı Gör',
      description: 'Cevabın değerlendirilir. Hata yaptıysan, nedenini detaylı açıklama ile öğren.',
    },
    {
      icon: Lightbulb,
      title: 'Kavramı İncele',
      description: 'Hata arkasındaki kavramı gözden geçir. Eksik olduğunu noktayı belirle ve anla.',
    },
    {
      icon: Repeat,
      title: 'Tekrar Dene',
      description: 'Benzer bir soru çözerek bilgiyi pekiştir. Öğrendiğini kalıcı hale getir.',
    },
    {
      icon: TrendingUp,
      title: 'İlerlemeni Takip Et',
      description: 'Konu bazlı ilerlemeni gör, zayıf noktalarını belirle ve hedeflerine ulaş.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-navy-50">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge color="brand" className="mb-4">
            <Target className="h-3.5 w-3.5" />
            Öğrenme Döngüsü
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">
            Beş adımda kalıcı öğrenme
          </h2>
          <p className="mt-4 text-lg text-navy-500">
            Kubik, sadece soru çözmekle kalmaz — her hatayı bir öğrenme fırsatına dönüştürür.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                <Card hover className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xs font-bold text-navy-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-navy-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{step.description}</p>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-2.5 z-10 -translate-y-1/2">
                    <ArrowRight className="h-4 w-4 text-navy-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProgramsSection() {
  return (
    <section id="programs" className="py-20 lg:py-28 bg-white">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge color="navy" className="mb-4">
            <ListChecks className="h-3.5 w-3.5" />
            Programlar
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">
            Her seviye için uygun program
          </h2>
          <p className="mt-4 text-lg text-navy-500">
            İlkokuldan üniversite sınavına kadar, her öğrenci için hedefe yönelik içerik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => {
            const Icon = getIcon(program.icon);
            return (
              <Card key={program.id} hover className="flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900">{program.name}</h3>
                    <Badge color="brand" className="mt-1">{program.shortName}</Badge>
                  </div>
                </div>
                <p className="text-sm text-navy-500 leading-relaxed mb-5">{program.description}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {program.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-navy-600">
                      <CheckCircle2 className="h-4 w-4 text-success-600 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant="outline" fullWidth>
                    Bu Programa Başla
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MistakesSection() {
  return (
    <section id="mistakes" className="py-20 lg:py-28 bg-navy-950 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
      <div className="relative container-page">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge color="navy" className="bg-white/10 text-brand-200 border-white/10 mb-4">
              <RefreshCw className="h-3.5 w-3.5" />
              Hata Takibi
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">
              Her hata, bir öğrenme fırsatıdır
            </h2>
            <p className="text-lg text-navy-200 leading-relaxed mb-6">
              Yanlış cevapladığın her soru otomatik olarak hatalar listene eklenir.
              Hatanın nedenini oku, ilgili kavramı gözden geçir ve benzer sorularla bilginini pekiştir.
            </p>
            <ul className="space-y-3">
              {[
                'Hataların konu ve kavram bazında kategorize edilir',
                'Her hata için detaylı açıklama ve çözüm sunulur',
                'Zayıf konuların otomatik olarak belirlenir',
                'İlerleme takibi ile gelişimini görürsün',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-navy-100">
                  <CheckCircle2 className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl p-6 shadow-elevated">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-navy-500">Hatalar Listesi</span>
                <Badge color="error">3 aktif hata</Badge>
              </div>
              <div className="space-y-3">
                {[
                  { topic: 'Tam Sayılar', concept: 'Mutlak değer', subject: 'Matematik' },
                  { topic: 'Hücre ve Organeller', concept: 'Kloroplast', subject: 'Fen Bilimleri' },
                  { topic: 'Sözcükte Anlam', concept: 'Mecaz anlam', subject: 'Türkçe' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-50 text-error-600 shrink-0">
                      <XCircle className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">{item.topic}</p>
                      <p className="text-xs text-navy-400">{item.concept} · {item.subject}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-navy-300 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-navy-400">Örnek görüntü — demo veri</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-28 bg-navy-50">
      <div className="container-page max-w-3xl">
        <div className="text-center mb-14">
          <Badge color="navy" className="mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            Sıkça Sorulan Sorular
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">
            Merak ettiklerin
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <Card key={index} padding="sm" className="overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 py-2 px-1 text-left"
              >
                <span className="text-sm font-semibold text-navy-900">{item.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-navy-400 shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="pb-2 px-1 text-sm text-navy-500 leading-relaxed animate-slide-down">
                  {item.answer}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-navy-500 mb-4">Hala soruların var mı?</p>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Ücretsiz Hesap Oluştur
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <PublicLayout>
      <HeroSection />
      <HowItWorksSection />
      <ProgramsSection />
      <MistakesSection />
      <FAQSection />
    </PublicLayout>
  );
}
