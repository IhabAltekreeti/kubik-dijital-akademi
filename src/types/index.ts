export type EducationLevel = 'ortaokul' | 'lise' | 'lgs' | 'yks';

export type Program = 'lgs' | 'yks' | 'ortaokul' | 'lise';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface StudentProfile {
  id: string;
  displayName: string;
  email: string;
  educationLevel: EducationLevel;
  program: Program;
  dailyStudyGoalMinutes: number;
  createdAt: string;
  isDemo: boolean;
  role?: UserRole;
  grade?: number;
  linkedParentId?: string;
  linkedTeacherIds?: string[];
}

export interface Session {
  userId: string;
  loggedInAt: string;
}

export type QuestionType = 'multiple_choice' | 'true_false';
export type Subject = 'matematik' | 'fen_bilimleri' | 'turkce' | 'tarih' | 'inkilap' | 'din' | 'ingilizce' | 'biyoloji' | 'fizik' | 'kimya' | 'edebiyat' | 'cografya';

export type ContentSource = 'meb' | 'authored' | 'ai_generated' | 'ai_generated_validated';
export type ValidationStatus = 'verified' | 'ai_validated' | 'unverified';

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  program: Program;
  questionType: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  concept: string;
  optionExplanations?: string[];
  relatedQuestionIds?: string[];
  source?: ContentSource;
  validationStatus?: ValidationStatus;
  grade?: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  subject: Subject;
  topic: string;
  questionIds: string[];
  startedAt: string;
  completedAt: string | null;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
}

export interface AnswerRecord {
  id: string;
  userId: string;
  questionId: string;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  isSkipped: boolean;
  sessionId: string;
  attemptNumber: number;
  answeredAt: string;
}

export interface MistakeEntry {
  id: string;
  userId: string;
  questionId: string;
  subject: Subject;
  topic: string;
  addedAt: string;
  reviewed: boolean;
  reviewCount: number;
  resolvedAt: string | null;
}

export interface LearningProgress {
  userId: string;
  totalAttempts: number;
  uniqueQuestionsAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalSkipped: number;
  subjectStats: Record<string, {
    attempts: number;
    correct: number;
    incorrect: number;
    skipped: number;
  }>;
  topicStats: Record<string, {
    attempts: number;
    correct: number;
    incorrect: number;
    skipped: number;
  }>;
  studyMinutesByDay: Record<string, number>;
  lastStudyDate: string | null;
}

// Study plan and assignments

export type TaskOrigin = 'teacher' | 'counselor' | 'student' | 'ai';
export type TaskType = 'practice' | 'reading' | 'review' | 'exam' | 'assignment';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface StudyTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  origin: TaskOrigin;
  type: TaskType;
  subject?: Subject;
  topic?: string;
  estimatedMinutes: number;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
  assignedBy?: string;
  assignedByName?: string;
  practiceLink?: string;
}

export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';
export type ExamStatus = 'upcoming' | 'completed' | 'missed';

export interface Assignment {
  id: string;
  userId: string;
  title: string;
  description: string;
  subject: Subject;
  topic?: string;
  assignedBy: string;
  assignedByName: string;
  dueDate: string;
  status: AssignmentStatus;
  questionCount: number;
  createdAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
}

export interface ExamEntry {
  id: string;
  userId: string;
  title: string;
  subject: Subject;
  examDate: string;
  status: ExamStatus;
  topics: string[];
  description: string;
  source: 'demo_seed';
}

export interface TaskChangeRequest {
  id: string;
  taskId: string;
  userId: string;
  requestType: 'extend_deadline' | 'modify_content' | 'cancel';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

// Topic mastery

export type MasteryLevel = 'not_started' | 'learning' | 'practicing' | 'mastered' | 'needs_review';

export interface TopicMasteryRecord {
  userId: string;
  subject: Subject;
  topic: string;
  attempts: number;
  correct: number;
  incorrect: number;
  lastAttemptAt: string | null;
  recentResults: boolean[];
  masteryLevel: MasteryLevel;
  masteryScore: number;
  hasEnoughData: boolean;
}

// AI assistant

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isHint?: boolean;
  isError?: boolean;
}

export interface AIContext {
  grade?: number;
  subject?: Subject;
  topic?: string;
  questionText?: string;
  options?: string[];
  correctOptionIndex?: number;
  selectedOptionIndex?: number | null;
  explanation?: string;
  studentName?: string;
}

export interface GeminiConfig {
  available: boolean;
  reason?: string;
}

export interface GeminiExplanationRequest {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  selectedOptionIndex: number | null;
  explanation: string;
  subject: Subject;
  topic: string;
  grade?: number;
  mode: 'hint' | 'explain' | 'topic' | 'similar_question';
}

export interface GeminiExplanationResult {
  content: string;
  source: 'authored' | 'gemini';
  isHint?: boolean;
}

export interface GeneratedQuestion {
  id: string;
  subject: Subject;
  topic: string;
  program: Program;
  grade?: number;
  questionType: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  concept: string;
  source: 'ai_generated';
  validationStatus: 'ai_validated' | 'unverified';
  generatedAt: string;
}

// Teacher profile (for demo seed)

export interface TeacherProfile {
  id: string;
  displayName: string;
  subject: Subject;
  role: 'teacher';
  isDemo: boolean;
}
