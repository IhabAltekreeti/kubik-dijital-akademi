const SCHEMA_VERSION = 2;

const KEYS = {
  schemaVersion: 'kubik_schema_version',
  users: 'kubik_users',
  session: 'kubik_session',
  practiceSessions: 'kubik_practice_sessions',
  answers: 'kubik_answers',
  mistakes: 'kubik_mistakes',
  progress: 'kubik_progress',
  studyTasks: 'kubik_study_tasks',
  assignments: 'kubik_assignments',
  exams: 'kubik_exams',
  taskChangeRequests: 'kubik_task_change_requests',
  generatedQuestions: 'kubik_generated_questions',
  seedVersion: 'kubik_seed_version',
  chatHistory: 'kubik_chat_history',
} as const;

export const storageKeys = KEYS;

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or unavailable
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const storage = {
  get: getItem,
  set: setItem,
  remove: removeItem,
};

export function ensureSchemaVersion(): void {
  const version = getItem<number>(KEYS.schemaVersion);
  if (version === null) {
    setItem(KEYS.schemaVersion, SCHEMA_VERSION);
    return;
  }
  if (version < SCHEMA_VERSION) {
    // Migration from v1 → v2: backfill role on existing users, preserve all data
    const users = getItem<Record<string, unknown>[]>(KEYS.users) ?? [];
    const migrated = users.map((u) => {
      if (u.role === undefined) {
        return { ...u, role: 'student' };
      }
      return u;
    });
    setItem(KEYS.users, migrated);
    setItem(KEYS.schemaVersion, SCHEMA_VERSION);
  }
}

export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}-${random}`;
}
