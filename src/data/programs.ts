import type { Program, Subject } from '@/types';

export interface ProgramInfo {
  id: Program;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  subjects: Subject[];
  features: string[];
}

export const programs: ProgramInfo[] = [
  {
    id: 'lgs',
    name: 'LGS Hazırlık',
    shortName: 'LGS',
    description: '8. sınıf öğrencileri için Liselere Geçiş Sistemi sınavına yönelik kapsamlı hazırlık programı.',
    icon: 'graduation-cap',
    subjects: ['matematik', 'fen_bilimleri', 'turkce', 'inkilap', 'din', 'ingilizce'],
    features: [
      'Temel kavramlardan sınav sorularına kadar adım adım ilerleyin',
      'Hatalarınızdan öğrenerek tekrar denemeler yapın',
      'Konu bazlı ilerlemenizi takip edin',
    ],
  },
  {
    id: 'yks',
    name: 'YKS Hazırlık',
    shortName: 'YKS',
    description: 'Lise öğrencileri için Yükseköğretim Kurumları Sınavı (AYT ve TYT) hazırlık programı.',
    icon: 'book-open',
    subjects: ['matematik', 'fizik', 'kimya', 'biyoloji', 'turkce', 'tarih', 'edebiyat', 'cografya', 'inkilap', 'ingilizce'],
    features: [
      'TYT ve AYT konularını sistematik şekilde çalışın',
      'Zayıf konularınızı belirleyin ve üzerine gidin',
      'Sınav stratejinizi veriye dayalı olarak geliştirin',
    ],
  },
  {
    id: 'ortaokul',
    name: 'Ortaokul Destek',
    shortName: 'Ortaokul',
    description: '5–8. sınıf öğrencileri için okul derslerini destekleyici pratik ve konu tekrarı.',
    icon: 'pencil',
    subjects: ['matematik', 'fen_bilimleri', 'turkce', 'inkilap', 'din', 'ingilizce'],
    features: [
      'Okul müfredatına paralel konu tekrarı',
      'Ödev ve sınavlara yönelik pratik sorular',
      'Konu eksikliklerini zamanında tespit edin',
    ],
  },
  {
    id: 'lise',
    name: 'Lise Destek',
    shortName: 'Lise',
    description: '9–12. sınıf öğrencileri için okul derslerini pekiştirici çalışma ve sınav hazırlığı.',
    icon: 'calculator',
    subjects: ['matematik', 'fizik', 'kimya', 'biyoloji', 'edebiyat', 'tarih', 'cografya', 'ingilizce'],
    features: [
      'Lise müfredatına uygun konu anlatımı ve sorular',
      'Dönem sınavlarına yönelik hedefli çalışma',
      'Üniversite hazırlığına erken başlayın',
    ],
  },
];

export function getProgram(id: Program): ProgramInfo | undefined {
  return programs.find((p) => p.id === id);
}

export const subjectLabels: Record<Subject, string> = {
  matematik: 'Matematik',
  fen_bilimleri: 'Fen Bilimleri',
  turkce: 'Türkçe',
  tarih: 'Tarih',
  inkilap: 'İnkılap Tarihi',
  din: 'Din Kültürü',
  ingilizce: 'İngilizce',
  biyoloji: 'Biyoloji',
  fizik: 'Fizik',
  kimya: 'Kimya',
  edebiyat: 'Edebiyat',
  cografya: 'Coğrafya',
};

export const subjectIcons: Record<Subject, string> = {
  matematik: 'calculator',
  fen_bilimleri: 'flask-conical',
  turkce: 'book-open',
  tarih: 'landmark',
  inkilap: 'scroll',
  din: 'moon',
  ingilizce: 'languages',
  biyoloji: 'leaf',
  fizik: 'atom',
  kimya: 'test-tube',
  edebiyat: 'pen-tool',
  cografya: 'map',
};

export interface SubjectTopic {
  subject: Subject;
  topic: string;
  description: string;
  questionCount: number;
}

export const subjectTopics: SubjectTopic[] = [
  // LGS / Ortaokul shared
  { subject: 'matematik', topic: 'Tam Sayılar', description: 'Pozitif ve negatif tam sayılarda işlemler, mutlak değer.', questionCount: 5 },
  { subject: 'matematik', topic: 'Rasyonel Sayılar', description: 'Kesirler, ondalık gösterimler ve rasyonel sayılarla işlemler.', questionCount: 5 },
  { subject: 'matematik', topic: 'Çarpanlar ve Katlar', description: 'Bölünebilme kuralları, ebob-ekok, asal çarpanlara ayırma.', questionCount: 5 },
  { subject: 'matematik', topic: 'Denklemler', description: 'Birinci dereceden bir ve iki bilinmeyenli denklemler.', questionCount: 5 },
  // YKS/Lise matematik
  { subject: 'matematik', topic: 'Limit ve Süreklilik', description: 'Limit kavramı, süreklilik, belirsizlik durumları. (Lise/YKS)', questionCount: 5 },
  // Fen Bilimleri (LGS)
  { subject: 'fen_bilimleri', topic: 'Madde ve Özellikleri', description: 'Maddenin halleri, kütle, hacim, özkütle kavramları.', questionCount: 5 },
  { subject: 'fen_bilimleri', topic: 'Hücre ve Organeller', description: 'Hayvan ve bitki hücresi yapısı, organeller ve görevleri.', questionCount: 5 },
  { subject: 'fen_bilimleri', topic: 'Kuvvet ve Hareket', description: 'Sabitleyici kuvvet, sürtünme, hız, ivme kavramları.', questionCount: 5 },
  // Fizik (YKS/Lise)
  { subject: 'fizik', topic: 'Vektörler', description: 'Vektörel büyüklükler, vektör toplama, bileşke vektör. (Lise/YKS)', questionCount: 5 },
  { subject: 'fizik', topic: 'Kinematik', description: 'Tek boyutlu hareket, yer değiştirme, hız, ivme. (Lise/YKS)', questionCount: 5 },
  { subject: 'fizik', topic: 'Newton Hareket Yasaları', description: 'Eylemsizlik, ivme ve etki-tepki yasaları. (Lise/YKS)', questionCount: 5 },
  // Kimya (YKS/Lise)
  { subject: 'kimya', topic: 'Atom ve Periyodik Sistem', description: 'Atom modelleri, periyodik tablo, elektron dizilimi. (Lise/YKS)', questionCount: 5 },
  { subject: 'kimya', topic: 'Kimyasal Bağlar', description: 'İyonik, kovalent, metalik bağlar ve bileşiklerin adlandırılması. (Lise/YKS)', questionCount: 5 },
  { subject: 'kimya', topic: 'Mol Kavramı', description: 'Avogadro sayısı, mol-molekül dönüşümleri, gazların hacmi. (Lise/YKS)', questionCount: 5 },
  // Biyoloji (YKS/Lise)
  { subject: 'biyoloji', topic: 'Hücre Bölünmesi', description: 'Mitoz ve mayoz bölünme, kromozom davranışı. (Lise/YKS)', questionCount: 5 },
  { subject: 'biyoloji', topic: 'Genetik', description: 'Mendel genetiği, kalıtım, DNA ve RNA yapısı. (Lise/YKS)', questionCount: 5 },
  { subject: 'biyoloji', topic: 'Sistemler', description: 'Dolaşım, solunum, boşaltım ve sindirim sistemleri. (Lise/YKS)', questionCount: 5 },
  // Türkçe
  { subject: 'turkce', topic: 'Sözcükte Anlam', description: 'Gerçek, mecaz, yan ve terim anlam kavramları.', questionCount: 5 },
  { subject: 'turkce', topic: 'Ses Bilgisi', description: 'Ünlüler, ünsüzler, ses olayları ve yazım kuralları.', questionCount: 5 },
  { subject: 'turkce', topic: 'Cümlede Anlam', description: 'Cümle türleri, öznel-nesnel yargılar, ana düşünce.', questionCount: 5 },
  // Edebiyat (Lise/YKS)
  { subject: 'edebiyat', topic: 'Türk Edebiyatı Akımları', description: 'Servet-i Fünun, Fecr-i Ati, Milli Edebiyat dönemleri. (Lise/YKS)', questionCount: 5 },
  { subject: 'edebiyat', topic: 'Şiir Bilgisi', description: 'Nazım birimleri, kafiye, redif, ölçü kavramları. (Lise/YKS)', questionCount: 5 },
  // Tarih
  { subject: 'tarih', topic: 'İlk Türk Devletleri', description: 'Hunlar, Göktürkler, Uygurlar ve Türk göçebe kültürü. (Lise/YKS)', questionCount: 5 },
  { subject: 'tarih', topic: 'Osmanlı Kuruluş Dönemi', description: 'Osmanlı Beyliği\'nin kuruluşu ve ilk sultanları. (Lise/YKS)', questionCount: 5 },
  // İnkılap
  { subject: 'inkilap', topic: 'Kurtuluş Savaşı', description: 'Kurtuluş Savaşı\'nın hazırlık dönemi ve cepheleri.', questionCount: 5 },
  { subject: 'inkilap', topic: 'Atatürk İlkeleri', description: 'Cumhuriyetçilik, halkçılık, laiklik gibi Atatürk ilkeleri.', questionCount: 5 },
  // İngilizce
  { subject: 'ingilizce', topic: 'Tenses', description: 'Present Simple, Present Continuous, Past Simple zamanları.', questionCount: 5 },
  { subject: 'ingilizce', topic: 'Vocabulary', description: 'Günlük kelime kullanımı ve eş anlamlılar. (Lise/YKS)', questionCount: 5 },
  // Coğrafya
  { subject: 'cografya', topic: 'Türkiye\'nin Coğrafi Konumu', description: 'Türkiye\'nin coğrafi konumu ve sonuçları. (Lise/YKS)', questionCount: 5 },
];

export const faqItems: { question: string; answer: string }[] = [
  {
    question: 'Kubik nedir?',
    answer: 'Kubik, LGS, YKS ve okul derslerine hazırlanan öğrenciler için tasarlanmış bir öğrenme platformudur. Soru çözün, hatalarınızı inceleyin, konu eksikliklerinizi tespit edin ve ilerlemenizi takip edin.',
  },
  {
    question: 'Kubik nasıl çalışır?',
    answer: 'Bir soru çözersiniz, cevabınız değerlendirilir, hata yaptıysanız nedeni açıklanır. Ardından ilgili konuyu gözden geçirir ve benzer bir soruyla bilginizi pekiştirirsiniz. İlerlemeniz her adımda kaydedilir.',
  },
  {
    question: 'Kubik ücretsiz mi?',
    answer: 'Bu sürüm, ürünün temel deneyimini sunan bir prototiptir. Üyelik gerektirmeden bazı özellikleri keşfedebilir, ücretsiz hesap oluşturarak tüm deneyimi deneyebilirsiniz.',
  },
  {
    question: 'Hangi sınıf ve sınavlar destekleniyor?',
    answer: 'LGS hazırlık, YKS hazırlık (TYT ve AYT), ortaokul ve lise destek programları mevcuttur. Her program kendi müfredatına uygun konuları ve soruları içerir.',
  },
  {
    question: 'Verilerim güvende mi?',
    answer: 'Bu prototip sürümünde verileriniz tarayıcınızda yerel olarak saklanır. Gerçek hesap güvenliği ve veri koruması için sunucu tabanlı kimlik doğrulama sistemi gelecekte eklenecektir.',
  },
  {
    question: 'Mistakes (hatalar) bölümü ne işe yarar?',
    answer: 'Yanlış cevapladığınız sorular otomatik olarak hatalar listenize eklenir. Burada hatanın nedenini okuyabilir, ilgili konuyu tekrar edebilir ve benzer sorularla bilgiyi pekiştirebilirsiniz.',
  },
];
