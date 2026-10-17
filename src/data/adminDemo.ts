// Yönetim paneli için demo verileri (Kübik Dijital Akademi Merkez).
// Tüm rakamlar burada; sunum öncesi gerçek değerlerle kolayca değiştirilebilir.
// 8-A ve 12-B şubelerinin akademik verileri öğretmen panelinden (teacherDemo.ts) canlı okunur.

export const demoAdmin = {
  id: 'demo-admin-ali',
  email: 'yonetim@kubik.com',
  displayName: 'Ali Hoca',
  title: 'Kurucu · Genel Müdür',
};

export const institution = {
  name: 'Kübik Dijital Akademi Merkez',
  term: '2026–2027',
  capacity: 240,
  enrollmentTarget: 230,
  lastYearStudents: 171,
};

export type Level = 'ara' | 'lgs' | 'yks' | 'mezun';

export const levelLabels: Record<Level, string> = {
  ara: 'Ara sınıf (5–7)',
  lgs: 'LGS (8. sınıf)',
  yks: 'YKS (11–12)',
  mezun: 'Mezun',
};

/** Yıllık ücretler (10 taksit) */
export const annualFees: Record<Level, number> = {
  ara: 36000,
  lgs: 42500,
  yks: 51000,
  mezun: 54000,
};
export const installmentCount = 10;

export interface Branch {
  id: string;
  name: string;
  level: Level;
  students: number;
  capacity: number;
  room: string;
  /** Son iki deneme ortalaması. LGS: toplam net/90, TYT: toplam net/120, ara sınıf: kazanım başarısı % */
  metric: 'LGS' | 'TYT' | 'KAZANIM';
  prev: number;
  last: number;
  attendance: number;
  homework: number;
  /** true ise devam/ödev öğretmen panelinden canlı okunur (Ali Hoca'nın şubeleri) */
  liveFromTeacher?: '8-A' | '12-B';
}

// 15 şube · toplam 206 öğrenci · kapasite 240
export const branches: Branch[] = [
  { id: '5-A', name: '5-A', level: 'ara', students: 12, capacity: 14, room: 'Derslik 1', metric: 'KAZANIM', prev: 61, last: 64, attendance: 93, homework: 84 },
  { id: '6-A', name: '6-A', level: 'ara', students: 14, capacity: 16, room: 'Derslik 1', metric: 'KAZANIM', prev: 58, last: 62, attendance: 91, homework: 80 },
  { id: '7-A', name: '7-A', level: 'ara', students: 15, capacity: 16, room: 'Derslik 2', metric: 'KAZANIM', prev: 57, last: 59, attendance: 90, homework: 78 },
  { id: '7-B', name: '7-B', level: 'ara', students: 13, capacity: 16, room: 'Derslik 2', metric: 'KAZANIM', prev: 55, last: 54, attendance: 86, homework: 71 },
  { id: '8-A', name: '8-A LGS', level: 'lgs', students: 9, capacity: 12, room: 'Derslik 3', metric: 'LGS', prev: 63.5, last: 66.8, attendance: 90, homework: 74, liveFromTeacher: '8-A' },
  { id: '8-B', name: '8-B LGS', level: 'lgs', students: 16, capacity: 18, room: 'Derslik 4', metric: 'LGS', prev: 58.4, last: 61.2, attendance: 92, homework: 83 },
  { id: '8-C', name: '8-C LGS', level: 'lgs', students: 15, capacity: 16, room: 'Derslik 4', metric: 'LGS', prev: 54.1, last: 55.0, attendance: 88, homework: 76 },
  { id: '11-A', name: '11-A Sayısal', level: 'yks', students: 15, capacity: 16, room: 'Derslik 6', metric: 'TYT', prev: 58.2, last: 61.0, attendance: 89, homework: 79 },
  { id: '11-B', name: '11-B Eşit Ağırlık', level: 'yks', students: 13, capacity: 16, room: 'Derslik 6', metric: 'TYT', prev: 55.6, last: 57.1, attendance: 87, homework: 75 },
  { id: '12-A', name: '12-A Sayısal', level: 'yks', students: 16, capacity: 18, room: 'Derslik 7', metric: 'TYT', prev: 71.4, last: 74.2, attendance: 93, homework: 86 },
  { id: '12-B', name: '12-B Sayısal', level: 'yks', students: 8, capacity: 12, room: 'Derslik 5', metric: 'TYT', prev: 75.9, last: 79.3, attendance: 91, homework: 83, liveFromTeacher: '12-B' },
  { id: '12-C', name: '12-C Eşit Ağırlık', level: 'yks', students: 15, capacity: 16, room: 'Derslik 8', metric: 'TYT', prev: 66.0, last: 66.4, attendance: 90, homework: 80 },
  { id: '12-D', name: '12-D Sözel', level: 'yks', students: 11, capacity: 14, room: 'Derslik 8', metric: 'TYT', prev: 60.3, last: 59.1, attendance: 84, homework: 70 },
  { id: 'M-A', name: 'Mezun-A Sayısal', level: 'mezun', students: 18, capacity: 20, room: 'Salon 1', metric: 'TYT', prev: 82.5, last: 85.9, attendance: 92, homework: 85 },
  { id: 'M-B', name: 'Mezun-B Eşit Ağırlık', level: 'mezun', students: 16, capacity: 20, room: 'Salon 2', metric: 'TYT', prev: 76.2, last: 78.0, attendance: 89, homework: 81 },
];

export const metricInfo: Record<Branch['metric'], { label: string; max: number; unit: string }> = {
  LGS: { label: 'LGS toplam net', max: 90, unit: 'net' },
  TYT: { label: 'TYT toplam net', max: 120, unit: 'net' },
  KAZANIM: { label: 'Kazanım başarısı', max: 100, unit: '%' },
};

/** Türkiye geneli deneme ortalamaları (yayınevi sonuç raporundan girilecek — DEMO DEĞER) */
export const turkeyAverages: { metric: 'LGS' | 'TYT'; exam: string; avg: number }[] = [
  { metric: 'LGS', exam: 'Türkiye Geneli LGS Denemesi 2', avg: 52.6 },
  { metric: 'TYT', exam: 'Türkiye Geneli TYT Denemesi 1', avg: 58.4 },
];

/* ------------------------------------------------------------------ */
/* Öğretmenler                                                         */
/* ------------------------------------------------------------------ */

export interface AdminTeacher {
  id: string;
  name: string;
  branch: string;
  classes: string[];
  weeklyHours: number;
  /** Dönem başından son denemeye kendi dersindeki net artışı (soru sayısına oranla %) */
  netGainPct: number;
  /** Veli memnuniyet anketi (1–5) */
  satisfaction: number;
  surveyCount: number;
  homeworkRate: number;
  attendanceRate: number;
  /** Veli mesajlarına ortalama dönüş süresi (saat) */
  replyHours: number;
  /** Ali Hoca: net, ödev ve devam öğretmen panelinden canlı gelir */
  live?: boolean;
  counselor?: boolean;
}

export const adminTeachers: AdminTeacher[] = [
  { id: 't-ali', name: 'Ali Hoca', branch: 'Fen Bilimleri · Biyoloji', classes: ['8-A LGS', '12-B Sayısal'], weeklyHours: 18, netGainPct: 0, satisfaction: 4.8, surveyCount: 21, homeworkRate: 0, attendanceRate: 0, replyHours: 4.5, live: true },
  { id: 't-murat', name: 'Murat Yıldız', branch: 'Matematik (YKS)', classes: ['11-A', '12-A', '12-B', 'Mezun-A'], weeklyHours: 24, netGainPct: 11, satisfaction: 4.7, surveyCount: 38, homeworkRate: 88, attendanceRate: 93, replyHours: 3 },
  { id: 't-hakan', name: 'Hakan Er', branch: 'Matematik (Ortaokul)', classes: ['7-A', '7-B', '8-A', '8-B', '8-C'], weeklyHours: 26, netGainPct: 7, satisfaction: 4.3, surveyCount: 41, homeworkRate: 81, attendanceRate: 90, replyHours: 9 },
  { id: 't-gulsen', name: 'Gülşen Aydemir', branch: 'Türk Dili ve Edebiyatı', classes: ['11-B', '12-C', '12-D', 'Mezun-B'], weeklyHours: 22, netGainPct: 7, satisfaction: 4.6, surveyCount: 29, homeworkRate: 84, attendanceRate: 91, replyHours: 6 },
  { id: 't-serkan', name: 'Serkan Bulut', branch: 'Fizik', classes: ['11-A', '12-A', '12-B', 'Mezun-A'], weeklyHours: 20, netGainPct: 6, satisfaction: 4.2, surveyCount: 33, homeworkRate: 76, attendanceRate: 92, replyHours: 14 },
  { id: 't-nihan', name: 'Nihan Erdoğan', branch: 'Kimya', classes: ['11-A', '12-A', '12-B', 'Mezun-A'], weeklyHours: 20, netGainPct: 6.5, satisfaction: 4.5, surveyCount: 31, homeworkRate: 86, attendanceRate: 92, replyHours: 5 },
  { id: 't-esra', name: 'Esra Güler', branch: 'Türkçe (Ortaokul)', classes: ['5-A', '6-A', '7-A', '7-B', '8-A', '8-B', '8-C'], weeklyHours: 28, netGainPct: 6.5, satisfaction: 4.6, surveyCount: 52, homeworkRate: 83, attendanceRate: 90, replyHours: 4 },
  { id: 't-burak', name: 'Burak Toprak', branch: 'Tarih · Coğrafya', classes: ['11-B', '12-C', '12-D', 'Mezun-B'], weeklyHours: 18, netGainPct: 4, satisfaction: 4.0, surveyCount: 24, homeworkRate: 72, attendanceRate: 87, replyHours: 20 },
  { id: 't-oguz', name: 'Oğuz Keskin', branch: 'Geometri', classes: ['11-A', '12-A', '12-C', 'Mezun-A', 'Mezun-B'], weeklyHours: 22, netGainPct: 8, satisfaction: 4.1, surveyCount: 36, homeworkRate: 79, attendanceRate: 91, replyHours: 11 },
  { id: 't-pinar', name: 'Pınar Uçar', branch: 'İngilizce', classes: ['5-A', '6-A', '7-A', '7-B', '8-A', '8-B', '8-C'], weeklyHours: 21, netGainPct: 5, satisfaction: 4.4, surveyCount: 47, homeworkRate: 80, attendanceRate: 89, replyHours: 7 },
  { id: 't-tuncay', name: 'Tuncay Kılıç', branch: 'Fen Bilimleri (Ortaokul)', classes: ['5-A', '6-A', '7-A', '7-B', '8-B', '8-C'], weeklyHours: 24, netGainPct: 3, satisfaction: 3.9, surveyCount: 44, homeworkRate: 70, attendanceRate: 88, replyHours: 26 },
  { id: 't-elif', name: 'Elif Şahin', branch: 'Rehberlik', classes: ['Tüm şubeler'], weeklyHours: 30, netGainPct: 0, satisfaction: 4.8, surveyCount: 58, homeworkRate: 0, attendanceRate: 0, replyHours: 3, counselor: true },
];

/** Rehberlik servisi bu dönem */
export const counselingStats = { studentMeetings: 64, parentMeetings: 23, plannedThisWeek: 9 };

/** Bileşik performans puanı ağırlıkları ve ölçekleri */
export const scoring = {
  weights: { net: 0.35, satisfaction: 0.25, homework: 0.15, attendance: 0.15, reply: 0.1 },
  /** Her %1 net artışı 8 puan (en fazla 100) */
  netPointsPerPct: 8,
  /** Dönüş süresi: 2 saat ve altı 100 puan, 48 saat ve üstü 0 puan */
  replyBestHours: 2,
  replyWorstHours: 48,
};

/* ------------------------------------------------------------------ */
/* Finans                                                              */
/* ------------------------------------------------------------------ */

export const months = ['Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
/** Taksit son ödeme günü (her ayın) */
export const installmentDueDay = 10;
/** Gerçekleşen aylık tahsilat oranları (%) — geçmiş aylar */
export const collectionRates = [94, 87];
/** Geçen yılın aynı ayları */
export const lastYearCollectionRates = [91, 84];
/** Gecikmesi olan toplam aile sayısı (listede en uzun gecikenler var) */
export const overdueFamilyCount = 31;

export interface OverdueFamily {
  id: string;
  parentName: string;
  studentName: string;
  className: string;
  level: Level;
  installments: number;
  daysLate: number;
  phone: string;
  lastAction: string;
}

export const overdueFamilies: OverdueFamily[] = [
  { id: 'od-1', parentName: 'Nermin Aksu', studentName: 'Baran Aksu', className: 'Mezun-A Sayısal', level: 'mezun', installments: 2, daysLate: 37, phone: '0533 *** ** 46', lastAction: 'Ödeme planı görüşmesi istendi' },
  { id: 'od-2', parentName: 'Murat Koç', studentName: 'Emir Koç', className: '8-A LGS', level: 'lgs', installments: 2, daysLate: 37, phone: '0535 *** ** 21', lastAction: '2 kez arandı, ulaşılamadı' },
  { id: 'od-3', parentName: 'Hülya Doğan', studentName: 'Eren Doğan', className: '12-D Sözel', level: 'yks', installments: 2, daysLate: 33, phone: '0542 *** ** 08', lastAction: 'Ay sonu ödeme sözü' },
  { id: 'od-4', parentName: 'Levent Erdem', studentName: 'Kaan Erdem', className: '12-B Sayısal', level: 'yks', installments: 1, daysLate: 7, phone: '0532 *** ** 63', lastAction: 'Hatırlatma yapılmadı' },
  { id: 'od-5', parentName: 'Tamer Kara', studentName: 'Alp Kara', className: '11-B Eşit Ağırlık', level: 'yks', installments: 1, daysLate: 7, phone: '0505 *** ** 72', lastAction: 'Hatırlatma yapılmadı' },
  { id: 'od-6', parentName: 'Sevgi Bozkurt', studentName: 'Ela Bozkurt', className: '8-C LGS', level: 'lgs', installments: 1, daysLate: 7, phone: '0544 *** ** 19', lastAction: 'Hatırlatma yapılmadı' },
  { id: 'od-7', parentName: 'Orhan Yavuz', studentName: 'Efe Yavuz', className: '7-B', level: 'ara', installments: 1, daysLate: 7, phone: '0536 *** ** 55', lastAction: 'Hatırlatma yapılmadı' },
  { id: 'od-8', parentName: 'Gamze Uslu', studentName: 'Duru Uslu', className: '6-A', level: 'ara', installments: 1, daysLate: 7, phone: '0538 *** ** 30', lastAction: 'Hatırlatma yapılmadı' },
];

/* ------------------------------------------------------------------ */
/* Ön kayıt (aday) takibi                                              */
/* ------------------------------------------------------------------ */

export type LeadStage = 'yeni' | 'arandi' | 'gorusme' | 'deneme' | 'kayit' | 'kayip';

export const leadStages: { id: LeadStage; label: string }[] = [
  { id: 'yeni', label: 'Yeni başvuru' },
  { id: 'arandi', label: 'Arandı' },
  { id: 'gorusme', label: 'Görüşme' },
  { id: 'deneme', label: 'Deneme dersi' },
  { id: 'kayit', label: 'Kayıt oldu' },
  { id: 'kayip', label: 'Kaybedildi' },
];

export const leadSources = ['Tavsiye (veli)', 'Tavsiye (öğrenci)', 'Instagram', 'Google', 'Web formu', 'Okul tanıtımı', 'Broşür'];
export const leadGrades = ['5. sınıf', '6. sınıf', '7. sınıf', '8. sınıf (LGS)', '11. sınıf (Sayısal)', '11. sınıf (EA)', '12. sınıf (Sayısal)', '12. sınıf (EA)', '12. sınıf (Sözel)', 'Mezun (Sayısal)', 'Mezun (EA)'];

export interface SeedLead {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  grade: string;
  source: string;
  daysAgo: number;
  stage: LeadStage;
  note: string;
}

export const seedLeads: SeedLead[] = [
  { id: 'lead-1', studentName: 'Yiğit Aslan', parentName: 'Canan Aslan', phone: '0532 *** ** 11', grade: '8. sınıf (LGS)', source: 'Tavsiye (veli)', daysAgo: 1, stage: 'yeni', note: 'Fatma Yılmaz\'ın tavsiyesiyle geldi.' },
  { id: 'lead-2', studentName: 'Ece Demirtaş', parentName: 'Okan Demirtaş', phone: '0541 *** ** 27', grade: '12. sınıf (Sayısal)', source: 'Instagram', daysAgo: 2, stage: 'yeni', note: 'Tıp hedefliyor, biyoloji desteği soruldu.' },
  { id: 'lead-3', studentName: 'Kuzey Sarı', parentName: 'Hande Sarı', phone: '0505 *** ** 38', grade: '7. sınıf', source: 'Okul tanıtımı', daysAgo: 3, stage: 'arandi', note: 'Deneme dersine davet edildi.' },
  { id: 'lead-4', studentName: 'Asya Kılınç', parentName: 'Erkan Kılınç', phone: '0533 *** ** 49', grade: 'Mezun (Sayısal)', source: 'Google', daysAgo: 4, stage: 'gorusme', note: 'Cumartesi 14:00 yüz yüze görüşme.' },
  { id: 'lead-5', studentName: 'Ömer Faruk Tan', parentName: 'Sibel Tan', phone: '0544 *** ** 52', grade: '8. sınıf (LGS)', source: 'Broşür', daysAgo: 5, stage: 'deneme', note: 'Fen deneme dersine katıldı, çok memnun kaldılar.' },
  { id: 'lead-6', studentName: 'Lara Yücel', parentName: 'Barış Yücel', phone: '0536 *** ** 63', grade: '11. sınıf (EA)', source: 'Web formu', daysAgo: 6, stage: 'arandi', note: 'Taksit seçenekleri soruldu.' },
  { id: 'lead-7', studentName: 'Emre Karakaya', parentName: 'Neslihan Karakaya', phone: '0542 *** ** 74', grade: '12. sınıf (EA)', source: 'Tavsiye (öğrenci)', daysAgo: 8, stage: 'gorusme', note: 'Fiyat görüşüldü, eşiyle konuşup dönecek.' },
  { id: 'lead-8', studentName: 'Nil Bayram', parentName: 'Gökçe Bayram', phone: '0535 *** ** 85', grade: '6. sınıf', source: 'Instagram', daysAgo: 9, stage: 'deneme', note: 'Matematik deneme dersine katıldı.' },
  { id: 'lead-9', studentName: 'Deniz Acar', parentName: 'Volkan Acar', phone: '0538 *** ** 96', grade: 'Mezun (EA)', source: 'Google', daysAgo: 12, stage: 'kayit', note: 'Mezun-B şubesine kaydoldu.' },
  { id: 'lead-10', studentName: 'Beren Özkan', parentName: 'Tülay Özkan', phone: '0532 *** ** 07', grade: '8. sınıf (LGS)', source: 'Tavsiye (veli)', daysAgo: 14, stage: 'kayit', note: '8-B şubesine kaydoldu.' },
  { id: 'lead-11', studentName: 'Batu Çakır', parentName: 'Ufuk Çakır', phone: '0543 *** ** 18', grade: '12. sınıf (Sayısal)', source: 'Okul tanıtımı', daysAgo: 16, stage: 'kayip', note: 'Fiyat nedeniyle başka kuruma gitti.' },
  { id: 'lead-12', studentName: 'Mira Eren', parentName: 'Aslı Eren', phone: '0537 *** ** 29', grade: '5. sınıf', source: 'Broşür', daysAgo: 20, stage: 'kayip', note: 'Servis güzergâhı uymadı.' },
];

/* ------------------------------------------------------------------ */
/* Risk ve devamsızlık                                                 */
/* ------------------------------------------------------------------ */

export interface SeedRiskStudent {
  name: string;
  className: string;
  level: 'high' | 'medium';
  reasons: string[];
  owner: string;
}

/** Ali Hoca'nın şubeleri dışındaki risk öğrencileri (8-A ve 12-B öğretmen panelinden canlı eklenir) */
export const seedRiskStudents: SeedRiskStudent[] = [
  { name: 'Baran Aksu', className: 'Mezun-A Sayısal', level: 'high', reasons: ['Son 2 denemede TYT neti 9 düştü', '2 taksit gecikmede'], owner: 'Elif Şahin' },
  { name: 'Eren Doğan', className: '12-D Sözel', level: 'high', reasons: ['Devam %72', '4 ödev teslim edilmedi'], owner: 'Gülşen Aydemir' },
  { name: 'Melis Ateş', className: '12-C Eşit Ağırlık', level: 'medium', reasons: ['TYT neti 3 denemedir düşüyor'], owner: 'Oğuz Keskin' },
  { name: 'Can Özer', className: '11-A Sayısal', level: 'medium', reasons: ['6 gündür platforma girmedi', 'Devam %80'], owner: 'Murat Yıldız' },
  { name: 'Ela Bozkurt', className: '8-C LGS', level: 'medium', reasons: ['Matematik neti 4 düştü'], owner: 'Hakan Er' },
  { name: 'Efe Yavuz', className: '7-B', level: 'medium', reasons: ['Devam %78'], owner: 'Tuncay Kılıç' },
];

/** Bugün dersi olan öğrenci sayısı (Cumartesi programı) */
export const todayExpected = 148;

export interface AbsentToday {
  name: string;
  className: string;
  status: 'habersiz' | 'izinli' | 'gec';
  note: string;
}

export const absentToday: AbsentToday[] = [
  { name: 'Emir Koç', className: '8-A LGS', status: 'habersiz', note: 'Veliye otomatik SMS gitti' },
  { name: 'Eren Doğan', className: '12-D Sözel', status: 'habersiz', note: 'Veliye otomatik SMS gitti' },
  { name: 'Arda Polat', className: '7-A', status: 'habersiz', note: 'Veliye otomatik SMS gitti' },
  { name: 'Can Özer', className: '11-A Sayısal', status: 'habersiz', note: 'Veli aranacak (SMS ulaşmadı)' },
  { name: 'Duru Uslu', className: '6-A', status: 'izinli', note: 'Diş randevusu, veli bildirdi' },
  { name: 'Nehir Çınar', className: 'Mezun-B Eşit Ağırlık', status: 'izinli', note: 'Doktor raporu' },
  { name: 'Mert Güneş', className: '12-B Sayısal', status: 'gec', note: '20 dk geç geldi' },
];

/* ------------------------------------------------------------------ */
/* Canlı akış (sabit örnek olaylar; panellerden gelen olaylar eklenir)  */
/* ------------------------------------------------------------------ */

export const seedActivity: { minutesAgo: number; kind: 'payment' | 'assignment' | 'attendance' | 'exam' | 'counseling' | 'message'; text: string }[] = [
  { minutesAgo: 12, kind: 'payment', text: 'Tahsilat: Yıldırım ailesi Ekim taksidini ödedi — ₺4.250' },
  { minutesAgo: 35, kind: 'assignment', text: 'Murat Yıldız, 12-A Sayısal şubesine "Türev Soru Seti" ödevini verdi' },
  { minutesAgo: 52, kind: 'attendance', text: 'Sabah yoklaması tamamlandı: 3 habersiz devamsızlık için velilere SMS gitti' },
  { minutesAgo: 140, kind: 'payment', text: 'Tahsilat: Polat ailesi Ekim taksidini ödedi — ₺5.100' },
  { minutesAgo: 300, kind: 'counseling', text: 'Elif Şahin, Baran Aksu ve velisiyle rehberlik görüşmesi yaptı' },
  { minutesAgo: 1560, kind: 'message', text: 'Gülşen Aydemir, 12-C velisinin mesajını 40 dk içinde cevapladı' },
  { minutesAgo: 4320, kind: 'exam', text: 'Türkiye Geneli LGS Denemesi 2 sonuçları yüklendi (40 öğrenci)' },
];
