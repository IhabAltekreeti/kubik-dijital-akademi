import type { StudentProfile, Session, UserRole } from '@/types';
import { storage, storageKeys, ensureSchemaVersion, generateId } from './storageService';

ensureSchemaVersion();

type StoredUser = StudentProfile & {
  passwordHash: string;
};

function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function stripPasswordHash(user: StoredUser): StudentProfile {
  const { passwordHash: _ph, ...profile } = user;
  void _ph;
  return profile;
}

function getUsers(): StoredUser[] {
  return storage.get<StoredUser[]>(storageKeys.users) ?? [];
}

function setUsers(users: StoredUser[]): void {
  storage.set(storageKeys.users, users);
}

function ensureRole(user: StoredUser): UserRole {
  return user.role ?? 'student';
}

export function getCurrentUser(): StudentProfile | null {
  const session = storage.get<Session>(storageKeys.session);
  if (!session) return null;
  const users = getUsers();
  const user = users.find((u) => u.id === session.userId);
  if (!user) return null;
  const profile = stripPasswordHash(user);
  profile.role = ensureRole(user);
  return profile;
}

export function getSession(): Session | null {
  return storage.get<Session>(storageKeys.session);
}

export interface RegisterParams {
  displayName: string;
  email: string;
  password: string;
  educationLevel: StudentProfile['educationLevel'];
  program: StudentProfile['program'];
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: StudentProfile;
}

export function register(params: RegisterParams): AuthResult {
  const trimmedName = params.displayName.trim();
  const trimmedEmail = params.email.trim().toLowerCase();

  if (trimmedName.length < 2) {
    return { success: false, error: 'Ad en az 2 karakter olmalıdır.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, error: 'Geçerli bir e-posta adresi giriniz.' };
  }
  if (params.password.length < 6) {
    return { success: false, error: 'Şifre en az 6 karakter olmalıdır.' };
  }

  const users = getUsers();
  if (users.some((u) => u.email === trimmedEmail)) {
    return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' };
  }

  const newUser: StoredUser = {
    id: generateId('u-'),
    displayName: trimmedName,
    email: trimmedEmail,
    educationLevel: params.educationLevel,
    program: params.program,
    dailyStudyGoalMinutes: 30,
    createdAt: new Date().toISOString(),
    isDemo: false,
    role: 'student',
    passwordHash: simpleHash(params.password),
  };

  users.push(newUser);
  setUsers(users);

  const profile = stripPasswordHash(newUser);
  const session: Session = {
    userId: newUser.id,
    loggedInAt: new Date().toISOString(),
  };
  storage.set(storageKeys.session, session);

  return { success: true, user: profile };
}

export function login(email: string, password: string, expectedRole?: UserRole): AuthResult {
  const trimmedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.email === trimmedEmail);

  if (!user) {
    return { success: false, error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' };
  }
  if (user.passwordHash !== simpleHash(password)) {
    return { success: false, error: 'Şifre hatalı.' };
  }

  const userRole = ensureRole(user);
  if (expectedRole && userRole !== expectedRole) {
    const roleLabels: Record<UserRole, string> = {
      student: 'öğrenci',
      parent: 'veli',
      teacher: 'öğretmen',
      admin: 'yönetici',
    };
    return {
      success: false,
      error: `Bu hesap ${roleLabels[userRole]} rolüne ait. Lütfen ${roleLabels[expectedRole]} girişini kullanın.`,
    };
  }

  const session: Session = {
    userId: user.id,
    loggedInAt: new Date().toISOString(),
  };
  storage.set(storageKeys.session, session);

  const profile = stripPasswordHash(user);
  profile.role = userRole;
  return { success: true, user: profile };
}

const demoAccounts: { role: UserRole; email: string; displayName: string; educationLevel: StudentProfile['educationLevel']; program: StudentProfile['program'] }[] = [
  { role: 'student', email: 'ayse@kubik.com', displayName: 'Ayşe Yılmaz', educationLevel: 'lgs', program: 'lgs' },
  { role: 'parent', email: 'demo-veli@kubik.com', displayName: 'Demo Veli', educationLevel: 'ortaokul', program: 'lgs' },
  { role: 'teacher', email: 'demo-ogretmen@kubik.com', displayName: 'Demo Öğretmen', educationLevel: 'lise', program: 'yks' },
  { role: 'admin', email: 'demo-admin@kubik.com', displayName: 'Demo Yönetici', educationLevel: 'lise', program: 'yks' },
];

export function loginAsDemo(role: UserRole = 'student'): AuthResult {
  const demo = demoAccounts.find((d) => d.role === role) ?? demoAccounts[0];
  const users = getUsers();
  let demoUser = users.find((u) => u.email === demo.email);

  if (!demoUser) {
    demoUser = {
      id: generateId('demo-'),
      displayName: demo.displayName,
      email: demo.email,
      educationLevel: demo.educationLevel,
      program: demo.program,
      dailyStudyGoalMinutes: 30,
      createdAt: new Date().toISOString(),
      isDemo: true,
      role: demo.role,
      passwordHash: simpleHash('demo123'),
    };
    users.push(demoUser);
    setUsers(users);
  }

  const session: Session = {
    userId: demoUser.id,
    loggedInAt: new Date().toISOString(),
  };
  storage.set(storageKeys.session, session);

  const profile = stripPasswordHash(demoUser);
  profile.role = ensureRole(demoUser);
  return { success: true, user: profile };
}

export function loginAsDemoStudentByEmail(email: string): AuthResult {
  const users = getUsers();
  const demoUser = users.find((u) => u.email === email);
  if (!demoUser) {
    return { success: false, error: 'Demo öğrenci bulunamadı.' };
  }

  const session: Session = {
    userId: demoUser.id,
    loggedInAt: new Date().toISOString(),
  };
  storage.set(storageKeys.session, session);

  const profile = stripPasswordHash(demoUser);
  profile.role = ensureRole(demoUser);
  return { success: true, user: profile };
}

export function getDashboardPath(role: UserRole = 'student'): string {
  switch (role) {
    case 'parent': return '/parent';
    case 'teacher': return '/teacher';
    case 'admin': return '/admin';
    default: return '/app';
  }
}

export function logout(): void {
  storage.remove(storageKeys.session);
}

export function updateProfile(userId: string, updates: Partial<Pick<StudentProfile, 'displayName' | 'educationLevel' | 'program' | 'dailyStudyGoalMinutes'>>): AuthResult {
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return { success: false, error: 'Kullanıcı bulunamadı.' };
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  setUsers(users);

  const profile = stripPasswordHash(users[userIndex]);
  profile.role = ensureRole(users[userIndex]);
  return { success: true, user: profile };
}
