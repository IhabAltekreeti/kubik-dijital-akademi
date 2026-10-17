import { type ReactNode } from 'react';
import RoleLayout from '@/layouts/RoleLayout';
import { getUnreadCount } from '@/services/teacherService';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function TeacherLayout({ title, description, children, actions }: Props) {
  const unread = getUnreadCount();

  return (
    <RoleLayout
      role="teacher"
      pageTitle={title}
      pageDescription={description}
      navBadges={{ '/teacher/messages': unread }}
      actions={actions}
    >
      <div className="space-y-6 animate-fade-in">{children}</div>
    </RoleLayout>
  );
}
