import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, Save, CheckCircle2, Sparkles, Info, LogOut } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import RoleLayout from '@/layouts/RoleLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { getCurrentUser, updateProfile, logout } from '@/services/authService';
import { programs } from '@/data/programs';
import type { EducationLevel, Program, StudentProfile, UserRole } from '@/types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(user?.educationLevel ?? 'ortaokul');
  const [program, setProgram] = useState<Program>(user?.program ?? 'lgs');
  const [dailyGoal, setDailyGoal] = useState(user?.dailyStudyGoalMinutes ?? 30);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  const userRole: UserRole = user.role ?? 'student';
  const profile = user as StudentProfile;

  const programOptions = programs.map((p) => ({ value: p.id, label: p.name }));
  const levelOptions = [
    { value: 'ortaokul', label: 'Ortaokul (5-8. sınıf)' },
    { value: 'lgs', label: 'LGS Hazırlık (8. sınıf)' },
    { value: 'lise', label: 'Lise (9-12. sınıf)' },
    { value: 'yks', label: 'YKS Hazırlık (12. sınıf)' },
  ];
  const goalOptions = [
    { value: '15', label: '15 dakika' },
    { value: '30', label: '30 dakika' },
    { value: '45', label: '45 dakika' },
    { value: '60', label: '60 dakika' },
    { value: '90', label: '90 dakika' },
  ];

  function handleSave() {
    setError('');
    setSaved(false);

    if (displayName.trim().length < 2) {
      setError('Ad en az 2 karakter olmalıdır.');
      return;
    }

    const result = updateProfile(user!.id, {
      displayName: displayName.trim(),
      educationLevel,
      program,
      dailyStudyGoalMinutes: dailyGoal,
    });

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error ?? 'Profil güncellenemedi.');
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const content = (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card padding="lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-2xl shrink-0">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-navy-900 truncate">{profile.displayName}</h2>
            <p className="text-sm text-navy-400 truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {profile.isDemo && (
                <Badge color="warning">
                  <Sparkles className="h-3.5 w-3.5" />
                  Demo Hesabı
                </Badge>
              )}
              <Badge color="brand">
                {programs.find((p) => p.id === profile.program)?.shortName ?? profile.program}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <Card padding="lg">
        <div className="flex items-center gap-2.5 mb-5">
          <User className="h-5 w-5 text-navy-700" />
          <h3 className="text-base font-semibold text-navy-900">Bilgileri Düzenle</h3>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-error-50 border border-error-100 px-4 py-3 text-sm text-error-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-success-50 border border-success-100 px-4 py-3 text-sm text-success-700 animate-slide-down">
            <CheckCircle2 className="h-4 w-4" />
            Profil güncellendi.
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Ad Soyad"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="E-posta"
            type="email"
            value={profile.email}
            disabled
            hint="E-posta adresi değiştirilemez."
          />
          <Select
            label="Eğitim Seviyesi"
            options={levelOptions}
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
          />
          <Select
            label="Program"
            options={programOptions}
            value={program}
            onChange={(e) => setProgram(e.target.value as Program)}
          />
          <Select
            label="Günlük Çalışma Hedefi"
            options={goalOptions}
            value={String(dailyGoal)}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
          />

          <div className="rounded-xl bg-navy-50 border border-navy-100 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-navy-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-sm text-navy-600 leading-relaxed">
                  <span className="font-medium text-navy-700">Günlük hedef nasıl çalışır?</span>{' '}
                  Tamamladığın her pratik oturumunun süresi (başlangıç ve bitiş arası)
                  günün toplamına eklenir. Hedefe ulaştığında panelinde kutlama görünür.
                </p>
                <p className="text-sm text-navy-500 leading-relaxed">
                  <span className="font-medium text-navy-700">Eğitim seviyeni değiştirirsen</span>{' '}
                  mevcut çalışma geçmişin ve hataların silinmez. Yeni programa geçtiğinde
                  eski kayıtların ilerleme sayfanda kalır.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="primary" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Değişiklikleri Kaydet
            </Button>
          </div>
        </div>
      </Card>

      {/* Security notice */}
      <Card padding="md" className="bg-brand-50 border-brand-100">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-navy-900 mb-1">Prototip Hesabı</p>
            <p className="text-sm text-navy-600 leading-relaxed">
              Bu bir prototip sürümüdür ve verileriniz tarayıcınızda yerel olarak saklanır.
              Gerçek hesap güvenliği için sunucu tabanlı kimlik doğrulama sistemi gelecekte eklenecektir.
            </p>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy-900">Çıkış Yap</h3>
            <p className="text-sm text-navy-400">Hesabından çıkış yap ve ana sayfaya dön.</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Çıkış
          </Button>
        </div>
      </Card>
    </div>
  );

  if (userRole === 'student') {
    return (
      <AppLayout pageTitle="Profil" pageDescription="Hesap bilgilerini yönet">
        {content}
      </AppLayout>
    );
  }

  return (
    <RoleLayout pageTitle="Profil" pageDescription="Hesap bilgilerini yönet" role={userRole}>
      {content}
    </RoleLayout>
  );
}
