import { storage, storageKeys, generateId, ensureSchemaVersion } from './storageService';
import type {
  StudentProfile, StudyTask, Assignment, ExamEntry,
  PracticeSession, AnswerRecord, MistakeEntry, Subject,
} from '@/types';
import { sampleQuestions, getQuestionById } from '@/data/questions';

ensureSchemaVersion();

const SEED_VERSION = 2;

interface DemoStudentSeed {
  profile: StudentProfile & { passwordHash: string };
  sessions: Array<{ subject: Subject; topic: string; questionIds: string[]; daysAgo: number; correct: number; incorrect: number; skipped: number }>;
  tasks: Array<{ title: string; description: string; origin: StudyTask['origin']; type: StudyTask['type']; subject?: Subject; topic?: string; estimatedMinutes: number; dueInDays: number | null; assignedByName?: string; practiceLink?: string }>;
  assignments: Array<{ title: string; description: string; subject: Subject; topic?: string; assignedByName: string; dueInDays: number; questionCount: number; status: Assignment['status']; score: number | null }>;
  exams: Array<{ title: string; subject: Subject; examDateInDays: number; topics: string[]; description: string }>;
  password: string;
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

function daysAheadISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function questionsForTopic(subject: Subject, topic: string, count: number): string[] {
  return sampleQuestions
    .filter((q) => q.subject === subject && q.topic === topic)
    .slice(0, count)
    .map((q) => q.id);
}

function buildAnswerRecords(userId: string, sessionId: string, questionIds: string[], correctCount: number, incorrectCount: number, answeredAt: string): AnswerRecord[] {
  const records: AnswerRecord[] = [];
  for (let i = 0; i < questionIds.length; i++) {
    const q = getQuestionById(questionIds[i]);
    if (!q) continue;
    const isSkipped = i >= correctCount + incorrectCount;
    const isCorrect = i < correctCount;
    records.push({
      id: generateId('a-'),
      userId,
      questionId: questionIds[i],
      selectedOptionIndex: isSkipped ? null : (isCorrect ? q.correctOptionIndex : (q.correctOptionIndex + 1) % q.options.length),
      isCorrect,
      isSkipped,
      sessionId,
      attemptNumber: 1,
      answeredAt,
    });
  }
  return records;
}

function buildMistakesFromAnswers(userId: string, answers: AnswerRecord[]): MistakeEntry[] {
  const mistakes: MistakeEntry[] = [];
  const seen = new Set<string>();
  for (const a of answers) {
    if (a.isCorrect || a.isSkipped) continue;
    if (seen.has(a.questionId)) continue;
    seen.add(a.questionId);
    const q = getQuestionById(a.questionId);
    if (!q) continue;
    mistakes.push({
      id: generateId('m-'),
      userId,
      questionId: a.questionId,
      subject: q.subject,
      topic: q.topic,
      addedAt: a.answeredAt,
      reviewed: false,
      reviewCount: 0,
      resolvedAt: null,
    });
  }
  return mistakes;
}

const demoStudents: DemoStudentSeed[] = [
  {
    profile: {
      id: 'demo-student-ayse',
      displayName: 'Ayşe Yılmaz',
      email: 'ayse@kubik.com',
      educationLevel: 'lgs',
      program: 'lgs',
      dailyStudyGoalMinutes: 45,
      createdAt: daysAgoISO(30),
      isDemo: true,
      role: 'student',
      grade: 8,
      linkedParentId: 'demo-parent-1',
      linkedTeacherIds: ['demo-teacher-ali', 'demo-teacher-math'],
      passwordHash: simpleHash('demo123'),
    },
    password: 'demo123',
    sessions: [
      { subject: 'matematik', topic: 'Tam Sayılar', questionIds: questionsForTopic('matematik', 'Tam Sayılar', 5), daysAgo: 5, correct: 4, incorrect: 1, skipped: 0 },
      { subject: 'matematik', topic: 'Rasyonel Sayılar', questionIds: questionsForTopic('matematik', 'Rasyonel Sayılar', 5), daysAgo: 3, correct: 3, incorrect: 2, skipped: 0 },
      { subject: 'turkce', topic: 'Sözcükte Anlam', questionIds: questionsForTopic('turkce', 'Sözcükte Anlam', 5), daysAgo: 2, correct: 5, incorrect: 0, skipped: 0 },
      { subject: 'fen_bilimleri', topic: 'Kuvvet ve Hareket', questionIds: questionsForTopic('fen_bilimleri', 'Kuvvet ve Hareket', 5), daysAgo: 1, correct: 3, incorrect: 2, skipped: 0 },
    ],
    tasks: [
      { title: 'Matematik - Denklemler Pratiği', description: 'Birinci dereceden denklemleri çözme üzerine 10 soru.', origin: 'teacher', type: 'practice', subject: 'matematik', topic: 'Denklemler', estimatedMinutes: 30, dueInDays: 2, assignedByName: 'Matematik Öğretmeni', practiceLink: '/app/practice?subject=matematik&topic=Denklemler' },
      { title: 'Türkçe - Sözcükte Anlam Tekrarı', description: 'Mecaz ve yan anlam konularını tekrar et.', origin: 'counselor', type: 'review', subject: 'turkce', topic: 'Sözcükte Anlam', estimatedMinutes: 20, dueInDays: 1, assignedByName: 'Rehberlik', practiceLink: '/app/practice?subject=turkce&topic=Sözcükte Anlam' },
      { title: 'Fen - Kuvvet ve Hareket Hatalarını İncele', description: 'Son çalışmanda hatalı yaptığın soruları gözden geçir.', origin: 'ai', type: 'review', subject: 'fen_bilimleri', topic: 'Kuvvet ve Hareket', estimatedMinutes: 15, dueInDays: null, practiceLink: '/app/mistakes' },
      { title: 'Günlük 20 dakika İngilizce kelime çalış', description: 'Yeni kelimeleri öğren ve cümle içinde kullan.', origin: 'student', type: 'reading', subject: 'ingilizce', estimatedMinutes: 20, dueInDays: 0 },
    ],
    assignments: [
      { title: 'LGS Deneme Sınavı 1', description: 'Matematik ve Fen bölümünden oluşan mini deneme.', subject: 'matematik', assignedByName: 'Matematik Öğretmeni', dueInDays: 3, questionCount: 10, status: 'not_started', score: null },
      { title: 'Türkçe Okuma Anlama', description: 'Paragraf sorularını çöz.', subject: 'turkce', assignedByName: 'Türkçe Öğretmeni', dueInDays: -1, questionCount: 5, status: 'submitted', score: 80 },
    ],
    exams: [
      { title: 'LGS Deneme Sınavı', subject: 'matematik', examDateInDays: 7, topics: ['Tam Sayılar', 'Rasyonel Sayılar', 'Denklemler'], description: 'Genel tekrar niteliğinde deneme sınavı.' },
    ],
  },
  {
    profile: {
      id: 'demo-student-mehmet',
      displayName: 'Mehmet Demir',
      email: 'mehmet@kubik.com',
      educationLevel: 'lgs',
      program: 'lgs',
      dailyStudyGoalMinutes: 30,
      createdAt: daysAgoISO(25),
      isDemo: true,
      role: 'student',
      grade: 8,
      linkedParentId: 'demo-parent-2',
      linkedTeacherIds: ['demo-teacher-math', 'demo-teacher-turkce'],
      passwordHash: simpleHash('demo123'),
    },
    password: 'demo123',
    sessions: [
      { subject: 'matematik', topic: 'Tam Sayılar', questionIds: questionsForTopic('matematik', 'Tam Sayılar', 5), daysAgo: 4, correct: 2, incorrect: 3, skipped: 0 },
      { subject: 'ingilizce', topic: 'Tenses', questionIds: questionsForTopic('ingilizce', 'Tenses', 5), daysAgo: 2, correct: 4, incorrect: 1, skipped: 0 },
      { subject: 'inkilap', topic: 'Atatürk İlkeleri', questionIds: questionsForTopic('inkilap', 'Atatürk İlkeleri', 5), daysAgo: 1, correct: 3, incorrect: 1, skipped: 1 },
    ],
    tasks: [
      { title: 'Matematik - Tam Sayılar Tekrarı', description: 'Tam sayılarda işlemler konusunu tekrar et.', origin: 'teacher', type: 'practice', subject: 'matematik', topic: 'Tam Sayılar', estimatedMinutes: 25, dueInDays: 1, assignedByName: 'Matematik Öğretmeni', practiceLink: '/app/practice?subject=matematik&topic=Tam Sayılar' },
      { title: 'İngilizce - Tenses Çalışması', description: 'Present Simple ve Past Simple konularını çalış.', origin: 'student', type: 'reading', subject: 'ingilizce', topic: 'Tenses', estimatedMinutes: 20, dueInDays: 0 },
    ],
    assignments: [
      { title: 'İnkılap Tarihi Quiz', description: 'Atatürk ilkeleri üzerine kısa quiz.', subject: 'inkilap', assignedByName: 'Sınıf Öğretmeni', dueInDays: 5, questionCount: 5, status: 'not_started', score: null },
    ],
    exams: [
      { title: 'LGS 2. Deneme', subject: 'matematik', examDateInDays: 14, topics: ['Tam Sayılar', 'Rasyonel Sayılar'], description: 'Okul içi deneme sınavı.' },
    ],
  },
  {
    profile: {
      id: 'demo-student-zeynep',
      displayName: 'Zeynep Kaya',
      email: 'zeynep@kubik.com',
      educationLevel: 'yks',
      program: 'yks',
      dailyStudyGoalMinutes: 60,
      createdAt: daysAgoISO(20),
      isDemo: true,
      role: 'student',
      grade: 12,
      linkedParentId: 'demo-parent-3',
      linkedTeacherIds: ['demo-teacher-ali', 'demo-teacher-math'],
      passwordHash: simpleHash('demo123'),
    },
    password: 'demo123',
    sessions: [
      { subject: 'matematik', topic: 'Tam Sayılar', questionIds: questionsForTopic('matematik', 'Tam Sayılar', 5), daysAgo: 3, correct: 4, incorrect: 1, skipped: 0 },
      { subject: 'turkce', topic: 'Sözcükte Anlam', questionIds: questionsForTopic('turkce', 'Sözcükte Anlam', 5), daysAgo: 2, correct: 4, incorrect: 1, skipped: 0 },
      { subject: 'fen_bilimleri', topic: 'Kuvvet ve Hareket', questionIds: questionsForTopic('fen_bilimleri', 'Kuvvet ve Hareket', 5), daysAgo: 1, correct: 3, incorrect: 2, skipped: 0 },
    ],
    tasks: [
      { title: 'YKS Matematik - Belirslik Limit', description: 'Limit konusundan AYT seviyesinde sorular çöz.', origin: 'teacher', type: 'practice', subject: 'matematik', estimatedMinutes: 45, dueInDays: 3, assignedByName: 'Matematik Öğretmeni' },
      { title: 'Biyoloji - Hücre Bölünmesi Okuma', description: 'Mitoz ve mayoz bölünmeyi tekrar et.', origin: 'counselor', type: 'reading', subject: 'biyoloji', estimatedMinutes: 30, dueInDays: 2, assignedByName: 'Rehberlik' },
      { title: 'Günlük TYT denemesi çöz', description: 'Günde en az 30 soru çöz.', origin: 'student', type: 'practice', estimatedMinutes: 60, dueInDays: 0 },
    ],
    assignments: [
      { title: 'TYT Deneme Sınavı 3', description: 'TYT genel deneme sınavı.', subject: 'matematik', assignedByName: 'Matematik Öğretmeni', dueInDays: 4, questionCount: 40, status: 'in_progress', score: null },
      { title: 'Türkçe Paragraf Seti', description: '20 paragraf sorusu.', subject: 'turkce', assignedByName: 'Türkçe Öğretmeni', dueInDays: -2, questionCount: 20, status: 'graded', score: 75 },
    ],
    exams: [
      { title: 'AYT Deneme Sınavı', subject: 'biyoloji', examDateInDays: 10, topics: ['Hücre Bölünmesi', 'Genetik'], description: 'AYT biyoloji deneme sınavı.' },
      { title: 'TYT Genel Deneme', subject: 'matematik', examDateInDays: 21, topics: ['Tam Sayılar', 'Denklemler', 'Limit'], description: 'Okul genel TYT denemesi.' },
    ],
  },
  {
    profile: {
      id: 'demo-student-can',
      displayName: 'Can Özkan',
      email: 'can@kubik.com',
      educationLevel: 'yks',
      program: 'yks',
      dailyStudyGoalMinutes: 45,
      createdAt: daysAgoISO(15),
      isDemo: true,
      role: 'student',
      grade: 11,
      linkedParentId: 'demo-parent-4',
      linkedTeacherIds: ['demo-teacher-math'],
      passwordHash: simpleHash('demo123'),
    },
    password: 'demo123',
    sessions: [
      { subject: 'matematik', topic: 'Denklemler', questionIds: questionsForTopic('matematik', 'Denklemler', 5), daysAgo: 2, correct: 2, incorrect: 3, skipped: 0 },
      { subject: 'fen_bilimleri', topic: 'Kuvvet ve Hareket', questionIds: questionsForTopic('fen_bilimleri', 'Kuvvet ve Hareket', 5), daysAgo: 1, correct: 2, incorrect: 2, skipped: 1 },
    ],
    tasks: [
      { title: 'Matematik - Denklemler Tekrarı', description: 'Birinci dereceden denklem çözümünü tekrar et.', origin: 'teacher', type: 'practice', subject: 'matematik', topic: 'Denklemler', estimatedMinutes: 30, dueInDays: 1, assignedByName: 'Matematik Öğretmeni', practiceLink: '/app/practice?subject=matematik&topic=Denklemler' },
      { title: 'Fen - Kuvvet ve Hareket Hataları', description: 'Hatalı sorularını incele ve tekrar çöz.', origin: 'ai', type: 'review', subject: 'fen_bilimleri', topic: 'Kuvvet ve Hareket', estimatedMinutes: 20, dueInDays: null, practiceLink: '/app/mistakes' },
    ],
    assignments: [
      { title: 'Fizik Vektörler Quiz', description: 'Vektör toplama ve bileşke üzerine quiz.', subject: 'fizik', assignedByName: 'Fizik Öğretmeni', dueInDays: 6, questionCount: 10, status: 'not_started', score: null },
    ],
    exams: [],
  },
];

export function seedDemoData(): void {
  const currentSeedVersion = storage.get<number>(storageKeys.seedVersion);
  if (currentSeedVersion !== null && currentSeedVersion >= SEED_VERSION) {
    return;
  }

  const existingUsers = storage.get<Record<string, unknown>[]>(storageKeys.users) ?? [];
  const existingIds = new Set(existingUsers.map((u) => u.id as string));

  // Add demo students that don't already exist
  const newUsers = [...existingUsers];
  for (const seed of demoStudents) {
    if (!existingIds.has(seed.profile.id)) {
      newUsers.push(seed.profile as unknown as Record<string, unknown>);
    }
  }
  storage.set(storageKeys.users, newUsers);

  // Seed learning data only for students who don't already have records
  const existingAnswers = storage.get<AnswerRecord[]>(storageKeys.answers) ?? [];
  const existingSessions = storage.get<PracticeSession[]>(storageKeys.practiceSessions) ?? [];
  const existingMistakes = storage.get<MistakeEntry[]>(storageKeys.mistakes) ?? [];
  const existingTasks = storage.get<StudyTask[]>(storageKeys.studyTasks) ?? [];
  const existingAssignments = storage.get<Assignment[]>(storageKeys.assignments) ?? [];
  const existingExams = storage.get<ExamEntry[]>(storageKeys.exams) ?? [];

  const userIdsWithData = new Set([
    ...existingAnswers.map((a) => a.userId),
    ...existingSessions.map((s) => s.userId),
  ]);

  const allAnswers = [...existingAnswers];
  const allSessions = [...existingSessions];
  const allMistakes = [...existingMistakes];
  const allTasks = [...existingTasks];
  const allAssignments = [...existingAssignments];
  const allExams = [...existingExams];

  for (const seed of demoStudents) {
    if (userIdsWithData.has(seed.profile.id)) continue;

    // Sessions + answers + mistakes
    for (const sess of seed.sessions) {
      const sessionId = generateId('ps-');
      const startedAt = daysAgoISO(sess.daysAgo);
      const completedAt = new Date(new Date(startedAt).getTime() + 15 * 60000).toISOString();
      const sessionAnswers = buildAnswerRecords(seed.profile.id, sessionId, sess.questionIds, sess.correct, sess.incorrect, completedAt);
      allAnswers.push(...sessionAnswers);
      allMistakes.push(...buildMistakesFromAnswers(seed.profile.id, sessionAnswers));

      allSessions.push({
        id: sessionId,
        userId: seed.profile.id,
        subject: sess.subject,
        topic: sess.topic,
        questionIds: sess.questionIds,
        startedAt,
        completedAt,
        totalQuestions: sess.questionIds.length,
        correctCount: sess.correct,
        incorrectCount: sess.incorrect,
        skippedCount: sess.skipped,
      });
    }

    // Tasks
    for (const task of seed.tasks) {
      allTasks.push({
        id: generateId('task-'),
        userId: seed.profile.id,
        title: task.title,
        description: task.description,
        origin: task.origin,
        type: task.type,
        subject: task.subject,
        topic: task.topic,
        estimatedMinutes: task.estimatedMinutes,
        dueDate: task.dueInDays !== null ? daysAheadISO(task.dueInDays) : null,
        status: task.dueInDays !== null && task.dueInDays < 0 ? 'completed' : 'pending',
        createdAt: daysAgoISO(7),
        completedAt: task.dueInDays !== null && task.dueInDays < 0 ? daysAgoISO(-task.dueInDays) : null,
        assignedBy: task.origin === 'teacher' ? 'demo-teacher-math' : task.origin === 'counselor' ? 'demo-counselor' : undefined,
        assignedByName: task.assignedByName,
        practiceLink: task.practiceLink,
      });
    }

    // Assignments
    for (const a of seed.assignments) {
      allAssignments.push({
        id: generateId('asg-'),
        userId: seed.profile.id,
        title: a.title,
        description: a.description,
        subject: a.subject,
        assignedBy: 'demo-teacher',
        assignedByName: a.assignedByName,
        dueDate: daysAheadISO(a.dueInDays),
        status: a.status,
        questionCount: a.questionCount,
        createdAt: daysAgoISO(10),
        submittedAt: a.status === 'submitted' || a.status === 'graded' ? daysAgoISO(-a.dueInDays) : null,
        score: a.score,
        maxScore: a.score !== null ? 100 : null,
      });
    }

    // Exams
    for (const e of seed.exams) {
      allExams.push({
        id: generateId('exam-'),
        userId: seed.profile.id,
        title: e.title,
        subject: e.subject,
        examDate: daysAheadISO(e.examDateInDays),
        status: 'upcoming',
        topics: e.topics,
        description: e.description,
        source: 'demo_seed',
      });
    }
  }

  storage.set(storageKeys.answers, allAnswers);
  storage.set(storageKeys.practiceSessions, allSessions);
  storage.set(storageKeys.mistakes, allMistakes);
  storage.set(storageKeys.studyTasks, allTasks);
  storage.set(storageKeys.assignments, allAssignments);
  storage.set(storageKeys.exams, allExams);
  storage.set(storageKeys.seedVersion, SEED_VERSION);
}

export function getDemoStudentCredentials(): Array<{ email: string; password: string; displayName: string; grade: number; program: string }> {
  return demoStudents.map((s) => ({
    email: s.profile.email,
    password: s.password,
    displayName: s.profile.displayName,
    grade: s.profile.grade ?? 8,
    program: s.profile.program,
  }));
}
