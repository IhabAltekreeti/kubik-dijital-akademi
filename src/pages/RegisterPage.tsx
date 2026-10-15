import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, UserPlus, AlertCircle, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { register } from '@/services/authService';
import { programs } from '@/data/programs';
import type { EducationLevel, Program } from '@/types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('ortaokul');
  const [program, setProgram] = useState<Program>('lgs');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const programOptions = programs.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const levelOptions = [
    { value: 'ortaokul', label: 'Ortaokul (5-8. sınıf)' },
    { value: 'lgs', label: 'LGS Hazırlık (8. sınıf)' },
    { value: 'lise', label: 'Lise (9-12. sınıf)' },
    { value: 'yks', label: 'YKS Hazırlık (12. sınıf)' },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = register({
      displayName,
      email,
      password,
      educationLevel,
      program,
    });
    setLoading(false);

    if (result.success) {
      navigate('/app');
    } else {
      setError(result.error ?? 'Kayıt yapılamadı.');
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
            <h1 className="text-2xl font-bold text-navy-900 text-center mb-2">Hesap oluştur</h1>
            <p className="text-sm text-navy-500 text-center mb-6">
              Birkaç adımda ücretsiz kaydol ve çalışmaya başla.
            </p>

            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-error-50 border border-error-100 px-4 py-3 animate-slide-down">
                <AlertCircle className="h-5 w-5 text-error-600 shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ad Soyad"
                type="text"
                name="displayName"
                placeholder="Adınız"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
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
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                hint="Şifren en az 6 karakter olmalıdır."
              />
              <Select
                label="Eğitim Seviyesi"
                name="educationLevel"
                options={levelOptions}
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
              />
              <Select
                label="Program"
                name="program"
                options={programOptions}
                value={program}
                onChange={(e) => setProgram(e.target.value as Program)}
              />
              <Button type="submit" fullWidth size="lg" loading={loading}>
                <UserPlus className="h-4 w-4" />
                Üye Ol
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-navy-500">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Giriş yap
              </Link>
            </p>
          </Card>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
            <Info className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <p className="text-xs text-brand-700">
              Bu bir prototip sürümüdür. Verileriniz tarayıcınızda yerel olarak saklanır.
              Gerçek hesap güvenliği için sunucu tabanlı kimlik doğrulama gelecekte eklenecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
