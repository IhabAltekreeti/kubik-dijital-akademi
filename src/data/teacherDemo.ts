// Öğretmen paneli için demo verileri (Ali Hoca).
// Gerçek sistemde bu veriler dershane yönetim sisteminden (şube, deneme, ödev) gelecek.
import type { Subject } from '@/types';

export const demoTeacher = {
  id: 'demo-teacher-ali',
  /** Veli panelindeki öğretmen kimliği (mesajlar ve notlar bu id ile eşleşir). */
  staffId: 't-ali',
  displayName: 'Ali Hoca',
  email: 'ali.hoca@kubik.com',
  branches: 'Fen Bilimleri · Biyoloji',
};

export type ClassId = '8-A' | '12-B';

export interface TeacherClass {
  id: ClassId;
  name: string;
  programLabel: string;
  subject: Subject;
  subjectLabel: string;
  examType: 'LGS' | 'AYT';
  netMax: number;
  room: string;
  /** Konu ısı haritasında görünen müfredat konuları */
  topics: string[];
  /** Soru bankasından ödev hazırlanabilecek dersler */
  bankSubjects: Subject[];
  exams: { id: string; name: string; daysAgo: number }[];
  color: string;
}

export const teacherClasses: TeacherClass[] = [
  {
    id: '8-A',
    name: '8-A LGS',
    programLabel: 'LGS Hazırlık',
    subject: 'fen_bilimleri',
    subjectLabel: 'Fen Bilimleri',
    examType: 'LGS',
    netMax: 20,
    room: 'Derslik 3',
    topics: ['Mevsimler ve İklim', 'DNA ve Genetik Kod', 'Basınç', 'Madde ve Endüstri', 'Basit Makineler', 'Kuvvet ve Hareket'],
    bankSubjects: ['fen_bilimleri'],
    exams: [
      { id: 'l1', name: 'Kübik LGS Deneme 1', daysAgo: 56 },
      { id: 'l2', name: 'Kübik LGS Deneme 2', daysAgo: 42 },
      { id: 'l3', name: 'Türkiye Geneli Deneme 1', daysAgo: 28 },
      { id: 'l4', name: 'Kübik LGS Deneme 3', daysAgo: 14 },
      { id: 'l5', name: 'Türkiye Geneli Deneme 2', daysAgo: 3 },
    ],
    color: 'brand',
  },
  {
    id: '12-B',
    name: '12-B Sayısal',
    programLabel: 'YKS Hazırlık (Sayısal)',
    subject: 'biyoloji',
    subjectLabel: 'Biyoloji',
    examType: 'AYT',
    netMax: 13,
    room: 'Derslik 5',
    topics: ['Hücre Bölünmesi', 'Genetik', 'Sistemler', 'Bitki Biyolojisi', 'Ekoloji', 'Protein Sentezi'],
    bankSubjects: ['biyoloji'],
    exams: [
      { id: 'a1', name: 'Kübik AYT Deneme 1', daysAgo: 45 },
      { id: 'a2', name: 'Türkiye Geneli AYT 1', daysAgo: 24 },
      { id: 'a3', name: 'Kübik AYT Deneme 2', daysAgo: 5 },
    ],
    color: 'accent',
  },
];

export interface RosterStudent {
  id: string;
  name: string;
  classId: ClassId;
  studentNo: string;
  parentName: string;
  /** Platformda gerçek hesabı olan demo öğrenci (Ayşe, Mehmet, Zeynep) */
  linkedStudentId?: string;
  /** Ali Hoca'nın dersindeki netler (şubenin deneme sırasıyla) */
  nets: number[];
  /** Konu başarıları (yüzde) — şubenin konu sırasıyla */
  topicScores: number[];
  attendanceRate: number;
  homeworkDone: number;
  homeworkTotal: number;
  lastActiveDaysAgo: number;
  weeklyMinutes: number;
}

export const roster: RosterStudent[] = [
  // 8-A LGS — Fen Bilimleri (20 soru)
  { id: 'demo-student-ayse', linkedStudentId: 'demo-student-ayse', name: 'Ayşe Yılmaz', classId: '8-A', studentNo: 'KBK-2025-0148', parentName: 'Fatma Yılmaz', nets: [11, 12.33, 13, 14, 15.33], topicScores: [88, 82, 71, 76, 84, 60], attendanceRate: 90, homeworkDone: 5, homeworkTotal: 6, lastActiveDaysAgo: 0, weeklyMinutes: 270 },
  { id: 'demo-student-mehmet', linkedStudentId: 'demo-student-mehmet', name: 'Mehmet Demir', classId: '8-A', studentNo: 'KBK-2025-0151', parentName: 'Hasan Demir', nets: [9.67, 10.33, 11, 10.67, 8.33], topicScores: [70, 58, 41, 52, 63, 45], attendanceRate: 80, homeworkDone: 3, homeworkTotal: 6, lastActiveDaysAgo: 4, weeklyMinutes: 95 },
  { id: 'r-8a-03', name: 'Elif Arslan', classId: '8-A', studentNo: 'KBK-2025-0153', parentName: 'Zehra Arslan', nets: [14.33, 15, 15.67, 16.33, 17], topicScores: [92, 90, 84, 86, 91, 80], attendanceRate: 100, homeworkDone: 6, homeworkTotal: 6, lastActiveDaysAgo: 0, weeklyMinutes: 340 },
  { id: 'r-8a-04', name: 'Yusuf Çelik', classId: '8-A', studentNo: 'KBK-2025-0157', parentName: 'Kemal Çelik', nets: [12, 12.67, 13.33, 12.33, 13.67], topicScores: [80, 74, 58, 69, 77, 62], attendanceRate: 95, homeworkDone: 5, homeworkTotal: 6, lastActiveDaysAgo: 1, weeklyMinutes: 210 },
  { id: 'r-8a-05', name: 'Defne Aydın', classId: '8-A', studentNo: 'KBK-2025-0160', parentName: 'Selin Aydın', nets: [10.33, 11, 12.67, 13, 13.33], topicScores: [78, 70, 55, 72, 68, 58], attendanceRate: 85, homeworkDone: 4, homeworkTotal: 6, lastActiveDaysAgo: 2, weeklyMinutes: 160 },
  { id: 'r-8a-06', name: 'Emir Koç', classId: '8-A', studentNo: 'KBK-2025-0162', parentName: 'Murat Koç', nets: [8, 8.67, 9.33, 9, 9.67], topicScores: [62, 55, 38, 47, 58, 40], attendanceRate: 70, homeworkDone: 2, homeworkTotal: 6, lastActiveDaysAgo: 6, weeklyMinutes: 40 },
  { id: 'r-8a-07', name: 'Zeynep Şen', classId: '8-A', studentNo: 'KBK-2025-0165', parentName: 'Aylin Şen', nets: [13, 13.67, 14.33, 15, 14.67], topicScores: [86, 80, 66, 78, 82, 70], attendanceRate: 95, homeworkDone: 6, homeworkTotal: 6, lastActiveDaysAgo: 0, weeklyMinutes: 300 },
  { id: 'r-8a-08', name: 'Kerem Yıldırım', classId: '8-A', studentNo: 'KBK-2025-0168', parentName: 'Burcu Yıldırım', nets: [11.67, 12, 12.67, 13.33, 11], topicScores: [74, 72, 49, 64, 70, 55], attendanceRate: 90, homeworkDone: 4, homeworkTotal: 6, lastActiveDaysAgo: 1, weeklyMinutes: 150 },
  { id: 'r-8a-09', name: 'Ada Kurt', classId: '8-A', studentNo: 'KBK-2025-0171', parentName: 'Gökhan Kurt', nets: [12.33, 13, 13.67, 14.33, 15], topicScores: [84, 78, 63, 75, 80, 66], attendanceRate: 100, homeworkDone: 5, homeworkTotal: 6, lastActiveDaysAgo: 0, weeklyMinutes: 255 },

  // 12-B Sayısal — AYT Biyoloji (13 soru)
  { id: 'demo-student-zeynep', linkedStudentId: 'demo-student-zeynep', name: 'Zeynep Kaya', classId: '12-B', studentNo: 'KBK-2023-0412', parentName: 'Ahmet Kaya', nets: [8.75, 10, 11.5], topicScores: [92, 81, 74, 66, 79, 70], attendanceRate: 95, homeworkDone: 5, homeworkTotal: 5, lastActiveDaysAgo: 0, weeklyMinutes: 425 },
  { id: 'r-12b-02', name: 'Berk Öztürk', classId: '12-B', studentNo: 'KBK-2023-0415', parentName: 'Serdar Öztürk', nets: [7.5, 8.25, 9], topicScores: [80, 64, 60, 52, 71, 48], attendanceRate: 90, homeworkDone: 4, homeworkTotal: 5, lastActiveDaysAgo: 1, weeklyMinutes: 310 },
  { id: 'r-12b-03', name: 'İrem Polat', classId: '12-B', studentNo: 'KBK-2023-0418', parentName: 'Nurcan Polat', nets: [9.5, 10.25, 10.75], topicScores: [88, 79, 70, 63, 82, 68], attendanceRate: 100, homeworkDone: 5, homeworkTotal: 5, lastActiveDaysAgo: 0, weeklyMinutes: 390 },
  { id: 'r-12b-04', name: 'Kaan Erdem', classId: '12-B', studentNo: 'KBK-2023-0421', parentName: 'Levent Erdem', nets: [6.25, 7, 5.5], topicScores: [66, 48, 44, 40, 58, 35], attendanceRate: 75, homeworkDone: 2, homeworkTotal: 5, lastActiveDaysAgo: 5, weeklyMinutes: 120 },
  { id: 'r-12b-05', name: 'Selin Aksoy', classId: '12-B', studentNo: 'KBK-2023-0424', parentName: 'Derya Aksoy', nets: [8, 9.25, 10.5], topicScores: [85, 73, 68, 58, 77, 61], attendanceRate: 95, homeworkDone: 5, homeworkTotal: 5, lastActiveDaysAgo: 0, weeklyMinutes: 360 },
  { id: 'r-12b-06', name: 'Mert Güneş', classId: '12-B', studentNo: 'KBK-2023-0427', parentName: 'Ayhan Güneş', nets: [7.75, 8, 8.25], topicScores: [74, 58, 55, 47, 66, 42], attendanceRate: 85, homeworkDone: 3, homeworkTotal: 5, lastActiveDaysAgo: 3, weeklyMinutes: 200 },
  { id: 'r-12b-07', name: 'Nisa Karaca', classId: '12-B', studentNo: 'KBK-2023-0430', parentName: 'Filiz Karaca', nets: [10, 10.75, 11.25], topicScores: [90, 84, 77, 69, 85, 74], attendanceRate: 100, homeworkDone: 5, homeworkTotal: 5, lastActiveDaysAgo: 0, weeklyMinutes: 410 },
  { id: 'r-12b-08', name: 'Arda Tekin', classId: '12-B', studentNo: 'KBK-2023-0433', parentName: 'Cem Tekin', nets: [8.5, 9.75, 8.25], topicScores: [79, 61, 63, 50, 72, 46], attendanceRate: 90, homeworkDone: 4, homeworkTotal: 5, lastActiveDaysAgo: 1, weeklyMinutes: 260 },
];

/** Haftalık ders programı. day: 0=Pazar … 6=Cumartesi */
export interface ScheduleSlot {
  day: number;
  start: string;
  end: string;
  classId: ClassId;
  kind: 'Ders' | 'Etüt' | 'Soru çözümü';
  topic: string;
}

export const weeklySchedule: ScheduleSlot[] = [
  { day: 1, start: '17:30', end: '18:50', classId: '12-B', kind: 'Ders', topic: 'Genetik — Mendel çaprazlamaları' },
  { day: 2, start: '17:00', end: '18:20', classId: '8-A', kind: 'Ders', topic: 'Basınç — sıvı basıncı' },
  { day: 3, start: '19:00', end: '20:20', classId: '12-B', kind: 'Soru çözümü', topic: 'Hücre bölünmesi AYT soruları' },
  { day: 4, start: '18:30', end: '19:50', classId: '8-A', kind: 'Etüt', topic: 'Kuvvet ve hareket tekrarı' },
  { day: 5, start: '17:30', end: '18:50', classId: '12-B', kind: 'Ders', topic: 'Genetik — eş baskınlık, çok alellik' },
  { day: 6, start: '10:00', end: '11:20', classId: '8-A', kind: 'Ders', topic: 'Madde ve endüstri' },
  { day: 6, start: '13:30', end: '14:50', classId: '8-A', kind: 'Soru çözümü', topic: 'LGS fen karma deneme analizi' },
];

/** Velilerden gelmiş örnek mesajlar (öğretmen gelen kutusu boş görünmesin diye). */
export interface SeedParentMessage {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  kind: 'message' | 'meeting';
  text: string;
  hoursAgo: number;
  read: boolean;
}

export const seedParentMessages: SeedParentMessage[] = [
  { id: 'seed-pm-1', parentId: 'demo-parent-1', parentName: 'Fatma Yılmaz', studentId: 'demo-student-ayse', kind: 'message', text: 'Hocam merhaba, Ayşe son denemede fende çok iyi yaptı, teşekkür ederiz. Evde kuvvet ve hareket için hangi kaynağı önerirsiniz?', hoursAgo: 5, read: false },
  { id: 'seed-pm-2', parentId: 'demo-parent-3', parentName: 'Ahmet Kaya', studentId: 'demo-student-zeynep', kind: 'meeting', text: 'Zeynep\'in tıp hedefi için biyoloji çalışma planını konuşmak isteriz. Cumartesi öğleden sonra uygun musunuz?', hoursAgo: 20, read: false },
  { id: 'seed-pm-3', parentId: 'demo-parent-2', parentName: 'Hasan Demir', studentId: 'demo-student-mehmet', kind: 'message', text: 'Mehmet son günlerde evde hiç çalışmıyor, derste nasıl? Netleri düştü, endişeliyiz.', hoursAgo: 30, read: false },
  { id: 'seed-pm-4', parentId: 'parent-r-12b-04', parentName: 'Levent Erdem', studentId: 'r-12b-04', kind: 'message', text: 'Kaan geçen hafta iki derse gelemedi, hastaydı. Kaçırdığı konuları nasıl telafi edebilir?', hoursAgo: 52, read: true },
];

/** Öğretmenin daha önce verdiği ödevler (şube bazında). */
export interface SeedClassAssignment {
  id: string;
  classId: ClassId;
  title: string;
  description: string;
  topic: string;
  createdDaysAgo: number;
  dueInDays: number;
  questionCount: number;
  submitted: number;
  avgScore: number | null;
}

export const seedClassAssignments: SeedClassAssignment[] = [
  { id: 'ca-seed-1', classId: '8-A', title: 'Basınç Konu Tarama Testi', description: 'Katı, sıvı ve gaz basıncı üzerine 15 soruluk tarama testi.', topic: 'Basınç', createdDaysAgo: 6, dueInDays: 1, questionCount: 15, submitted: 6, avgScore: 64 },
  { id: 'ca-seed-2', classId: '8-A', title: 'DNA ve Genetik Kod Özet Çıkarma', description: 'Konuyu kavram haritası şeklinde özetleyip etüde getirin.', topic: 'DNA ve Genetik Kod', createdDaysAgo: 12, dueInDays: -3, questionCount: 0, submitted: 8, avgScore: 81 },
  { id: 'ca-seed-3', classId: '12-B', title: 'Genetik — Çaprazlama Soru Seti', description: 'Monohibrit ve dihibrit çaprazlama, 20 soru.', topic: 'Genetik', createdDaysAgo: 4, dueInDays: 3, questionCount: 20, submitted: 3, avgScore: 72 },
  { id: 'ca-seed-4', classId: '12-B', title: 'Bitki Biyolojisi Tekrar Testi', description: 'AYT çıkmış sorular ile 12 soruluk tekrar.', topic: 'Bitki Biyolojisi', createdDaysAgo: 9, dueInDays: -1, questionCount: 12, submitted: 6, avgScore: 58 },
];
