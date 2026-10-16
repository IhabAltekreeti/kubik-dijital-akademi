// Veli paneli için demo verileri.
// Gerçek sistemde bu veriler dershane yönetim sisteminden (yoklama, deneme, muhasebe) gelecek.

export interface DemoParent {
  id: string;
  displayName: string;
  email: string;
  relation: 'Anne' | 'Baba';
  honorific: 'Hanım' | 'Bey';
  phone: string;
}

export const demoParents: DemoParent[] = [
  { id: 'demo-parent-1', displayName: 'Fatma Yılmaz', email: 'veli.ayse@kubik.com', relation: 'Anne', honorific: 'Hanım', phone: '0532 *** ** 14' },
  { id: 'demo-parent-3', displayName: 'Ahmet Kaya', email: 'veli.zeynep@kubik.com', relation: 'Baba', honorific: 'Bey', phone: '0544 *** ** 87' },
];

export type ExamType = 'LGS' | 'TYT' | 'AYT';

export interface DemoExamResult {
  id: string;
  name: string;
  type: ExamType;
  daysAgo: number;
  sections: { label: string; net: number; max: number }[];
  score: number;
  rank: number;
  rankOf: number;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface DemoAttendance {
  daysAgo: number;
  lesson: string;
  status: AttendanceStatus;
}

export interface DemoTeacher {
  id: string;
  name: string;
  branch: string;
}

export interface DemoTeacherNote {
  teacherId: string;
  daysAgo: number;
  text: string;
  tone: 'positive' | 'neutral' | 'attention';
}

export interface DemoPayment {
  totalInstallments: number;
  paidInstallments: number;
  installmentAmount: number;
  nextDueInDays: number;
}

export interface StudentInfo {
  studentNo: string;
  school: string;
  birthDate: string; // ISO
  enrolledAt: string; // ISO
  schedule: string;
  shuttle: string;
  healthNote: string;
}

export interface ChildExtra {
  studentId: string;
  info: StudentInfo;
  className: string;
  programLabel: string;
  goal: string;
  counselor: string;
  teachers: DemoTeacher[];
  baseStudyMinutes: number[]; // son 7 gün (bugün en sonda) — dershane etüt + platform
  weeklyGoalMinutes: number;
  exams: DemoExamResult[];
  attendance: DemoAttendance[];
  notes: DemoTeacherNote[];
  payment: DemoPayment;
}

const lgsSections = (t: number, m: number, f: number, i: number, d: number, e: number) => [
  { label: 'Türkçe', net: t, max: 20 },
  { label: 'Matematik', net: m, max: 20 },
  { label: 'Fen', net: f, max: 20 },
  { label: 'İnkılap', net: i, max: 10 },
  { label: 'Din', net: d, max: 10 },
  { label: 'İngilizce', net: e, max: 10 },
];

const tytSections = (t: number, s: number, m: number, f: number) => [
  { label: 'Türkçe', net: t, max: 40 },
  { label: 'Sosyal', net: s, max: 20 },
  { label: 'Matematik', net: m, max: 40 },
  { label: 'Fen', net: f, max: 20 },
];

const aytSections = (m: number, fz: number, k: number, b: number) => [
  { label: 'Matematik', net: m, max: 40 },
  { label: 'Fizik', net: fz, max: 14 },
  { label: 'Kimya', net: k, max: 13 },
  { label: 'Biyoloji', net: b, max: 13 },
];

export const childExtras: Record<string, ChildExtra> = {
  'demo-student-ayse': {
    studentId: 'demo-student-ayse',
    info: {
      studentNo: 'KBK-2025-0148',
      school: 'Cumhuriyet Ortaokulu',
      birthDate: '2012-03-14',
      enrolledAt: '2025-09-08',
      schedule: 'Salı · Perşembe 17:00–20:00, Cumartesi 10:00–15:00',
      shuttle: 'Var · Güzergâh 3',
      healthNote: 'Bildirilmiş bir durum yok',
    },
    className: '8-A LGS',
    programLabel: 'LGS Hazırlık',
    goal: 'Hedef: Fen Lisesi',
    counselor: 'Elif Şahin',
    teachers: [
      { id: 't-murat', name: 'Murat Yıldız', branch: 'Matematik' },
      { id: 't-ali', name: 'Ali Hoca', branch: 'Fen Bilimleri' },
      { id: 't-elif', name: 'Elif Şahin', branch: 'Rehberlik' },
    ],
    baseStudyMinutes: [35, 45, 20, 55, 30, 60, 25],
    weeklyGoalMinutes: 45 * 7,
    exams: [
      { id: 'l1', name: 'Kübik LGS Deneme 1', type: 'LGS', daysAgo: 56, sections: lgsSections(13.67, 9.33, 11, 6.67, 8, 7), score: 382.4, rank: 34, rankOf: 120 },
      { id: 'l2', name: 'Kübik LGS Deneme 2', type: 'LGS', daysAgo: 42, sections: lgsSections(14.33, 11, 12.33, 7, 8.67, 7.67), score: 401.9, rank: 28, rankOf: 120 },
      { id: 'l3', name: 'Türkiye Geneli Deneme 1', type: 'LGS', daysAgo: 28, sections: lgsSections(15, 11.67, 13, 7.67, 9, 8), score: 414.6, rank: 25, rankOf: 120 },
      { id: 'l4', name: 'Kübik LGS Deneme 3', type: 'LGS', daysAgo: 14, sections: lgsSections(16.33, 13, 14, 8, 9, 8.67), score: 437.2, rank: 19, rankOf: 120 },
      { id: 'l5', name: 'Türkiye Geneli Deneme 2', type: 'LGS', daysAgo: 3, sections: lgsSections(17, 14.67, 15.33, 8.67, 9.67, 9), score: 455.8, rank: 14, rankOf: 120 },
    ],
    attendance: [
      { daysAgo: 1, lesson: 'Matematik', status: 'present' },
      { daysAgo: 1, lesson: 'Fen Bilimleri', status: 'present' },
      { daysAgo: 3, lesson: 'Türkiye Geneli Deneme', status: 'present' },
      { daysAgo: 4, lesson: 'Türkçe', status: 'present' },
      { daysAgo: 6, lesson: 'Matematik', status: 'late' },
      { daysAgo: 6, lesson: 'İnkılap Tarihi', status: 'present' },
      { daysAgo: 8, lesson: 'Fen Bilimleri', status: 'present' },
      { daysAgo: 10, lesson: 'Türkçe', status: 'absent' },
      { daysAgo: 11, lesson: 'Matematik', status: 'present' },
      { daysAgo: 13, lesson: 'Fen Bilimleri', status: 'present' },
    ],
    notes: [
      { teacherId: 't-murat', daysAgo: 2, tone: 'attention', text: 'Rasyonel sayılarda işlem hataları azaldı ama dikkat hataları devam ediyor. Evde günde 15 soru çözmesini öneriyorum.' },
      { teacherId: 't-ali', daysAgo: 4, tone: 'positive', text: 'Son denemede fen neti 15\'i geçti, çok güzel bir ivme var. Kuvvet ve hareket konusunu perşembe etüdünde pekiştireceğiz.' },
      { teacherId: 't-elif', daysAgo: 9, tone: 'neutral', text: 'Motivasyonu yüksek. Uyku düzenine ve deneme öncesi kaygı yönetimine birlikte dikkat edelim.' },
    ],
    payment: { totalInstallments: 9, paidInstallments: 4, installmentAmount: 4250, nextDueInDays: 12 },
  },
  'demo-student-zeynep': {
    studentId: 'demo-student-zeynep',
    info: {
      studentNo: 'KBK-2023-0412',
      school: 'Mehmet Akif Ersoy Anadolu Lisesi',
      birthDate: '2008-08-02',
      enrolledAt: '2023-09-11',
      schedule: 'Pzt · Çar · Cuma 17:30–21:00, hafta sonu deneme',
      shuttle: 'Yok',
      healthNote: 'Polen alerjisi (bahar aylarında)',
    },
    className: '12-B Sayısal',
    programLabel: 'YKS Hazırlık (Sayısal)',
    goal: 'Hedef: Tıp Fakültesi',
    counselor: 'Elif Şahin',
    teachers: [
      { id: 't-ali', name: 'Ali Hoca', branch: 'Biyoloji' },
      { id: 't-murat', name: 'Murat Yıldız', branch: 'Matematik' },
      { id: 't-elif', name: 'Elif Şahin', branch: 'Rehberlik' },
    ],
    baseStudyMinutes: [60, 55, 75, 40, 65, 80, 50],
    weeklyGoalMinutes: 60 * 7,
    exams: [
      { id: 't1', name: 'Kübik TYT Deneme 1', type: 'TYT', daysAgo: 49, sections: tytSections(27.5, 11.25, 21, 10.75), score: 362.1, rank: 22, rankOf: 85 },
      { id: 'a1', name: 'Kübik AYT Deneme 1', type: 'AYT', daysAgo: 45, sections: aytSections(17.5, 6.25, 6.5, 8.75), score: 341.7, rank: 25, rankOf: 85 },
      { id: 't2', name: 'Kübik TYT Deneme 2', type: 'TYT', daysAgo: 35, sections: tytSections(29.25, 12.5, 23.75, 12.5), score: 378.4, rank: 18, rankOf: 85 },
      { id: 'a2', name: 'Türkiye Geneli AYT 1', type: 'AYT', daysAgo: 24, sections: aytSections(19.25, 7.5, 7.25, 10), score: 362.9, rank: 17, rankOf: 85 },
      { id: 't3', name: 'Türkiye Geneli TYT 1', type: 'TYT', daysAgo: 21, sections: tytSections(30.5, 13.75, 25.5, 13.25), score: 391.6, rank: 15, rankOf: 85 },
      { id: 't4', name: 'Kübik TYT Deneme 3', type: 'TYT', daysAgo: 7, sections: tytSections(32.25, 14.5, 27.75, 15), score: 409.3, rank: 11, rankOf: 85 },
      { id: 'a3', name: 'Kübik AYT Deneme 2', type: 'AYT', daysAgo: 5, sections: aytSections(21.5, 8.25, 8.5, 11.5), score: 384.5, rank: 12, rankOf: 85 },
    ],
    attendance: [
      { daysAgo: 1, lesson: 'Biyoloji', status: 'present' },
      { daysAgo: 1, lesson: 'Matematik', status: 'present' },
      { daysAgo: 2, lesson: 'Fizik', status: 'present' },
      { daysAgo: 5, lesson: 'AYT Deneme', status: 'present' },
      { daysAgo: 7, lesson: 'TYT Deneme', status: 'present' },
      { daysAgo: 8, lesson: 'Kimya', status: 'excused' },
      { daysAgo: 9, lesson: 'Biyoloji', status: 'present' },
      { daysAgo: 9, lesson: 'Matematik', status: 'present' },
      { daysAgo: 12, lesson: 'Türkçe', status: 'present' },
      { daysAgo: 14, lesson: 'Fizik', status: 'present' },
    ],
    notes: [
      { teacherId: 't-ali', daysAgo: 1, tone: 'positive', text: 'Hücre bölünmeleri konusunda çok sağlam. Genetik konusuna geçtik; AYT biyoloji neti 3 denemedir yükseliyor.' },
      { teacherId: 't-murat', daysAgo: 3, tone: 'attention', text: 'Limit ve türevde konu iyi ama süre yönetimi sorunu var. Denemelerde matematiğe ayırdığı süreyi birlikte planlayalım.' },
      { teacherId: 't-elif', daysAgo: 6, tone: 'neutral', text: 'Mevcut net trendi tıp hedefiyle uyumlu. Haftalık 1 gün tam dinlenme önerdim, destek olursanız seviniriz.' },
    ],
    payment: { totalInstallments: 10, paidInstallments: 5, installmentAmount: 5100, nextDueInDays: 6 },
  },
};

export interface Announcement {
  id: string;
  title: string;
  body: string;
  inDays: number;
  kind: 'meeting' | 'exam' | 'info';
  audience: 'all' | 'lgs' | 'yks';
}

export const announcements: Announcement[] = [
  { id: 'n1', title: 'Veli Toplantısı', body: 'Dönem ortası veli toplantımız saat 14:00\'te dershanemizde yapılacaktır.', inDays: 8, kind: 'meeting', audience: 'all' },
  { id: 'n2', title: 'Türkiye Geneli LGS Denemesi', body: 'Saat 10:00 — öğrencilerimizin 09:30\'da dershanede olması rica olunur.', inDays: 4, kind: 'exam', audience: 'lgs' },
  { id: 'n3', title: 'Türkiye Geneli TYT–AYT Denemesi', body: 'İlk gün TYT, ikinci gün AYT. Sonuçlar 3 gün içinde panelde.', inDays: 5, kind: 'exam', audience: 'yks' },
  { id: 'n4', title: 'Ara Tatil Etüt Programı', body: 'Ara tatil boyunca her gün 10:00–16:00 arası etüt ve soru çözüm saatleri açıktır.', inDays: 15, kind: 'info', audience: 'all' },
];
