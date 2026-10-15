import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from '@/services/authService';
import type { UserRole } from '@/types';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import CoursesPage from '@/pages/CoursesPage';
import PracticePage from '@/pages/PracticePage';
import MistakesPage from '@/pages/MistakesPage';
import ProgressPage from '@/pages/ProgressPage';
import ProfilePage from '@/pages/ProfilePage';
import StudyPlanPage from '@/pages/StudyPlanPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import ParentDashboardPage from '@/pages/ParentDashboardPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case 'parent': return '/parent';
    case 'teacher': return '/teacher';
    case 'admin': return '/admin';
    default: return '/app';
  }
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  const userRole = user.role ?? 'student';
  if (userRole !== role) return <Navigate to={getDashboardPathForRole(userRole)} replace />;
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (user) return <Navigate to={getDashboardPathForRole(user.role ?? 'student')} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
        <Route path="/register" element={<RedirectIfAuthed><RegisterPage /></RedirectIfAuthed>} />

        {/* Student routes */}
        <Route path="/app" element={<RequireRole role="student"><DashboardPage /></RequireRole>} />
        <Route path="/app/courses" element={<RequireRole role="student"><CoursesPage /></RequireRole>} />
        <Route path="/app/practice" element={<RequireRole role="student"><PracticePage /></RequireRole>} />
        <Route path="/app/mistakes" element={<RequireRole role="student"><MistakesPage /></RequireRole>} />
        <Route path="/app/progress" element={<RequireRole role="student"><ProgressPage /></RequireRole>} />
        <Route path="/app/study-plan" element={<RequireRole role="student"><StudyPlanPage /></RequireRole>} />
        <Route path="/app/assistant" element={<RequireRole role="student"><AIAssistantPage /></RequireRole>} />
        <Route path="/app/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

        {/* Parent routes */}
        <Route path="/parent" element={<RequireRole role="parent"><ParentDashboardPage /></RequireRole>} />
        <Route path="/parent/profile" element={<RequireRole role="parent"><ProfilePage /></RequireRole>} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<RequireRole role="teacher"><TeacherDashboardPage /></RequireRole>} />
        <Route path="/teacher/profile" element={<RequireRole role="teacher"><ProfilePage /></RequireRole>} />

        {/* Admin routes */}
        <Route path="/admin" element={<RequireRole role="admin"><AdminDashboardPage /></RequireRole>} />
        <Route path="/admin/profile" element={<RequireRole role="admin"><ProfilePage /></RequireRole>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
