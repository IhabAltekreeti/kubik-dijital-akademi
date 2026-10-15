import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  AlertCircle,
  Users,
  Presentation,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { login, loginAsDemo, getDashboardPath } from '@/services/authService';
import type { UserRole } from '@/types';

const roleOptions: { value: UserRole; label: string; icon: typeof UserIcon }[] = [
  { value: 'student', label: 'Öğrenci', icon: GraduationCap },
  { value: 'parent', label: 'Veli', icon: Users },
  { value: 'teacher', label: 'Öğretmen', icon: Presentation },
  { value: 'admin', label: 'Yönetici', icon: Shield },
];

const demoLabels: Record<UserRole, string> = {
  student: 'Demo Öğrenci',
  parent: 'Demo Veli',
  teacher: 'Demo Öğretmen',
  admin: 'Demo Yönetici (Yerel)',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = login(email, password, selectedRole);
    setLoading(false);

    if (result.success && result.user) {
      navigate(getDashboardPath(result.user.role ?? 'student'));
    } else {
      setError(result.error ?? 'Giriş yapılamadı.');
    }
  }

  function handleDemoLogin(role: UserRole) {
    setError('');
    setLoading(true);
    const result = loginAsDemo(role);
    setLoading(false);
    if (result.success && result.user) {
      navigate(getDashboardPath(result.user.role ?? 'student'));
    } else {
      setError('Demo girişi başarısız.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy-50">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900">Kubik</span>
          </Link>

          <Card padding="lg">
            <h1 className="text-2xl font-bold text-navy-900 text-center mb-2">Tekrar hoş geldin</h1>
            <p className="text-sm text-navy-500 text-center mb-6">
              Hesabına giriş yap ve kaldığın yerden devam et.
            </p>

            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-error-50 border border-error-100 px-4 py-3 animate-slide-down">
                <AlertCircle className="h-5 w-5 text-error-600 shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            {/* Role selector */}
            <div className="mb-5">
              <p className="text-sm font-medium text-navy-700 mb-2">Giriş rolü</p>
              <div className="grid grid-cols-4 gap-2">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRole === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedRole(opt.value)}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        isSelected
                          ? 'bg-brand-50 border-brand-300 text-brand-700'
                          : 'bg-white border-navy-100 text-navy-500 hover:bg-navy-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="E-posta"
                type="email"
                name="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="Şifre"
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button type="submit" fullWidth size="lg" loading={loading}>
                <Lock className="h-4 w-4" />
                {roleOptions.find((r) => r.value === selectedRole)?.label} Girişi
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-navy-100" />
              <span className="text-xs text-navy-400 font-medium">demo hesaplar</span>
              <div className="flex-1 h-px bg-navy-100" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(opt.value)}
                    disabled={loading}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {demoLabels[opt.value]}
                  </Button>
                );
              })}
            </div>

            {selectedRole === 'admin' && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning-50 border border-warning-100 px-4 py-3">
                <Shield className="h-4 w-4 text-warning-600 shrink-0 mt-0.5" />
                <p className="text-xs text-warning-700">
                  Yönetici demo erişimi yalnızca yerel prototip içindir. Üretim ortamında güvenli erişim geçerli değildir.
                </p>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-navy-500">
              Hesabın yok mu?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Üye ol
              </Link>
            </p>
          </Card>

          <p className="mt-4 text-center text-xs text-navy-400">
            Bu bir prototip kimlik doğrulama sistemidir. Gerçek güvenlik için sunucu tabanlı sistem gelecekte eklenecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
