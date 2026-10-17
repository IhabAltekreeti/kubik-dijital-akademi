import { type ReactNode, useState } from 'react';
import { Link, useNavigate, Navigate, NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Pencil,
  AlertCircle,
  TrendingUp,
  CalendarCheck,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { StudentProfile, UserRole } from '@/types';
import { getCurrentUser, logout, getDashboardPath } from '@/services/authService';
import DemoSwitcher from '@/components/DemoSwitcher';

interface AppLayoutProps {
  children: ReactNode;
  pageTitle: string;
  pageDescription?: string;
  actions?: ReactNode;
}

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Panel', href: '/app', icon: LayoutDashboard },
  { label: 'Dersler', href: '/app/courses', icon: BookOpen },
  { label: 'Pratik', href: '/app/practice', icon: Pencil },
  { label: 'Çalışma Planı', href: '/app/study-plan', icon: CalendarCheck },
  { label: 'Hatalar', href: '/app/mistakes', icon: AlertCircle },
  { label: 'İlerleme', href: '/app/progress', icon: TrendingUp },
  { label: 'AI Asistan', href: '/app/assistant', icon: Sparkles },
  { label: 'Profil', href: '/app/profile', icon: User },
];

function SidebarNavLink({ item, onClick }: { item: typeof navItems[number]; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      end={item.href === '/app'}
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
      {item.label}
    </NavLink>
  );
}

export default function AppLayout({ children, pageTitle, pageDescription, actions }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole: UserRole = user.role ?? 'student';
  if (userRole !== 'student') {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const profile = user as StudentProfile;
  const headerActions =
    actions || user.isDemo ? (
      <>
        {actions}
        {user.isDemo && <DemoSwitcher current="student" />}
      </>
    ) : null;

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
            <SidebarNavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="border-t border-navy-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-sm shrink-0">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy-900 truncate">{profile.displayName}</p>
              <p className="text-xs text-navy-400 truncate">{profile.email}</p>
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
                <SidebarNavLink key={item.href} item={item} onClick={() => setSidebarOpen(false)} />
              ))}
            </nav>
            <div className="border-t border-navy-100 p-3">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-sm shrink-0">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-900 truncate">{profile.displayName}</p>
                  <p className="text-xs text-navy-400 truncate">{profile.email}</p>
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
            <Link to="/app/profile" aria-label="Profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              {profile.displayName.charAt(0).toUpperCase()}
            </Link>
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
              {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Mobile page title */}
          <div className="lg:hidden mb-5">
            <h1 className="text-xl font-bold text-navy-900">{pageTitle}</h1>
            {pageDescription && <p className="text-sm text-navy-400 mt-0.5">{pageDescription}</p>}
            {headerActions && <div className="mt-3 flex flex-wrap items-center gap-3">{headerActions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
