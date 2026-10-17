import { storage, generateId } from './storageService';

/** Yönetim panelinden gönderilen duyurular (veli panelinde en üstte görünür). */
export const ADMIN_ANNOUNCEMENTS_KEY = 'kubik_admin_announcements';

export type AdminAudience = 'all' | 'ara' | 'lgs' | 'yks' | 'mezun';

export const audienceLabels: Record<AdminAudience, string> = {
  all: 'Tüm veliler',
  ara: 'Ara sınıf velileri (5–7)',
  lgs: 'LGS velileri (8. sınıf)',
  yks: 'YKS velileri (11–12)',
  mezun: 'Mezun öğrenciler ve velileri',
};

export interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: AdminAudience;
  kind: 'meeting' | 'exam' | 'info';
  /** yyyy-mm-dd, isteğe bağlı etkinlik tarihi */
  eventDate: string | null;
  sms: boolean;
  recipients: number;
  smsCount: number;
  createdAt: string;
  createdBy: string;
}

export function getAdminAnnouncements(): AdminAnnouncement[] {
  return (storage.get<AdminAnnouncement[]>(ADMIN_ANNOUNCEMENTS_KEY) ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addAdminAnnouncement(input: Omit<AdminAnnouncement, 'id' | 'createdAt'>): AdminAnnouncement {
  const a: AdminAnnouncement = { ...input, id: generateId('ann-'), createdAt: new Date().toISOString() };
  storage.set(ADMIN_ANNOUNCEMENTS_KEY, [a, ...getAdminAnnouncements()]);
  return a;
}
