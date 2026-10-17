import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat } from 'lucide-react';
import RoleLayout from '@/layouts/RoleLayout';
import { getCurrentUser, loginAsDemoStudentByEmail } from '@/services/authService';
import { getUnreadCount } from '@/services/teacherService';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function TeacherLayout({ title, description, children, actions }: Props) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const unread = getUnreadCount();

  function viewAsParent() {
    const r = loginAsDemoStudentByEmail('veli.ayse@kubik.com');
    if (r.success) navigate('/parent');
  }

  return (
    <RoleLayout
      role="teacher"
      pageTitle={title}
      pageDescription={description}
      navBadges={{ '/teacher/messages': unread }}
      actions={
        <>
          {actions}
          {user?.isDemo && (
            <button
              onClick={viewAsParent}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-dashed border-navy-300 text-xs font-medium text-navy-600 hover:bg-navy-50"
              title="Sadece demo içindir: Fatma Yılmaz (Ayşe'nin velisi) olarak açar"
            >
              <Repeat className="h-3.5 w-3.5" />
              Veli olarak gör
            </button>
          )}
        </>
      }
    >
      <div className="space-y-6 animate-fade-in">{children}</div>
    </RoleLayout>
  );
}
