import { type ReactNode, useState } from 'react';
import { Link, useNavigate, Navigate, NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Users,
  Presentation,
  Shield,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Sparkles,
  BarChart3,
  UserPlus,
  Wallet,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { getCurrentUser, logout } from '@/services/authService';
import DemoSwitcher from '@/components/DemoSwitcher';

interface RoleLayoutProps {
  children: ReactNode;
  pageTitle: string;
  pageDescription?: string;
  role: UserRole;
  /** Başlık çubuğunun sağında gösterilecek butonlar */
  actions?: ReactNode;
  /** Menüde rozet (ör. okunmamış mesaj sayısı): href → sayı */
  navBadges?: Record<string, number>;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navByRole: Record<UserRole, NavItem[]> = {
  student: [],
  parent: [
    { label: 'Panel', href: '/parent', icon: LayoutDashboard },
    { label: 'Profil', href: '/parent/profile', icon: User },
  ],
  teacher: [
    { label: 'Ana Sayfa', href: '/teacher', icon: LayoutDashboard },
    { label: 'Şubelerim', href: '/teacher/classes', icon: BookOpen },
    { label: 'Öğrenciler', href: '/teacher/students', icon: Users },
    { label: 'Ödevler', href: '/teacher/assignments', icon: ClipboardList },
    { label: 'Veli Mesajları', href: '/teacher/messages', icon: MessageSquare },
    { label: 'Kübik AI', href: '/teacher/ai', icon: Sparkles },
    { label: 'Profil', href: '/teacher/profile', icon: User },
  ],
  admin: [
    { label: 'Genel Bakış', href: '/admin', icon: LayoutDashboard },
    { label: 'Akademik', href: '/admin/academics', icon: BarChart3 },
    { label: 'Öğretmenler', href: '/admin/teachers', icon: Presentation },
    { label: 'Ön Kayıt', href: '/admin/enrollment', icon: UserPlus },
    { label: 'Finans', href: '/admin/finance', icon: Wallet },
    { label: 'Duyurular', href: '/admin/announcements', icon: Megaphone },
    { label: 'Profil', href: '/admin/profile', icon: User },
  ],
};

const roleBadgeConfig: Record<UserRole, { label: string; icon: LucideIcon; color: string }> = {
  student: { label: 'Öğrenci', icon: GraduationCap, color: 'bg-brand-100 text-brand-700' },
  parent: { label: 'Veli', icon: Users, color: 'bg-success-100 text-success-700' },
  teacher: { label: 'Öğretmen', icon: Presentation, color: 'bg-warning-100 text-warning-700' },
  admin: { label: 'Yönetim', icon: Shield, color: 'bg-error-100 text-error-700' },
};

function SidebarNavLink({ item, onClick, badge }: { item: NavItem; onClick?: () => void; badge?: number }) {
  const Icon = item.icon;
  const isEnd = item.href === '/parent' || item.href === '/teacher' || item.href === '/admin';
  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      end={isEnd}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900',
        ].join(' ')
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span className="min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-error-500 text-[11px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function RoleLayout({ children, pageTitle, pageDescription, role, actions, navBadges }: RoleLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role ?? 'student';
  if (userRole !== role) {
    const redirectPath = userRole === 'student' ? '/app'
      : userRole === 'parent' ? '/parent'
      : userRole === 'teacher' ? '/teacher'
      : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navItems = navByRole[role];

  // Sunum kolaylığı: demo hesaplarda Öğrenci · Veli · Öğretmen · Yönetim arasında tek tık geçiş
  const headerActions =
    actions || user.isDemo ? (
      <>
        {actions}
        {user.isDemo && <DemoSwitcher current={role} />}
      </>
    ) : null;
  const badge = roleBadgeConfig[role];
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-navy-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-navy-100 fixed inset-y-0 left-0 z-30">
        <Link to="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-navy-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-navy-900">Kübik</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label="Ana navigasyon">
          {navItems.map((item) => (
            <SidebarNavLink key={item.href} item={item} badge={navBadges?.[item.href]} />
          ))}
        </nav>

        <div className="border-t border-navy-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold text-sm shrink-0 ${badge.color}`}>
              <BadgeIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy-900 truncate">{user.displayName}</p>
              <p className="text-xs text-navy-400 truncate">{badge.label}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Çıkış yap"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-600 hover:bg-error-50 hover:text-error-600 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-elevated flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-5 h-16 border-b border-navy-100">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-navy-900">Kübik</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Menüyü kapat"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-500 hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label="Mobil navigasyon">
              {navItems.map((item) => (
                <SidebarNavLink key={item.href} item={item} badge={navBadges?.[item.href]} onClick={() => setSidebarOpen(false)} />
              ))}
            </nav>
            <div className="border-t border-navy-100 p-3">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold text-sm shrink-0 ${badge.color}`}>
                  <BadgeIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-900 truncate">{user.displayName}</p>
                  <p className="text-xs text-navy-400 truncate">{badge.label}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Çıkış yap"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-600 hover:bg-error-50 hover:text-error-600 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-navy-100">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Menüyü aç"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-navy-900">Kübik</span>
            </Link>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${badge.color}`}>
              <BadgeIcon className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:block sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-navy-100">
          <div className="container-app">
            <div className="flex h-16 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-navy-900">{pageTitle}</h1>
                {pageDescription && <p className="text-sm text-navy-400">{pageDescription}</p>}
              </div>
              {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="lg:hidden mb-5">
            <h1 className="text-xl font-bold text-navy-900">{pageTitle}</h1>
            {pageDescription && <p className="text-sm text-navy-400 mt-0.5">{pageDescription}</p>}
            {headerActions && <div className="mt-3 flex flex-wrap items-center gap-2">{headerActions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
