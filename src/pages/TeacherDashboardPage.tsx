import { Presentation, BookOpen, Users, Info } from 'lucide-react';
import RoleLayout from '@/layouts/RoleLayout';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

export default function TeacherDashboardPage() {
  return (
    <RoleLayout
      pageTitle="Öğretmen Paneli"
      pageDescription="Öğrencilerinizi ve içerikleri yönetin"
      role="teacher"
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Öğretmen Paneli</h2>
            <p className="text-sm text-navy-500 mt-1">
              Bu panel, öğretmenlerin sınıflarını ve öğrenci performansını izlemesi için tasarlanmıştır.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Öğrenci Sayısı</p>
                <p className="text-xl font-bold text-navy-900">—</p>
                <p className="text-xs text-navy-400 mt-0.5">aktif</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Soru Bankası</p>
                <p className="text-xl font-bold text-navy-900">—</p>
                <p className="text-xs text-navy-400 mt-0.5">toplam soru</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-50 text-warning-600">
                <Presentation className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Sınıf Sayısı</p>
                <p className="text-xl font-bold text-navy-900">—</p>
                <p className="text-xs text-navy-400 mt-0.5">yönetilen</p>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <div className="flex items-center gap-2.5 mb-4">
            <Users className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-semibold text-navy-900">Sınıflarım</h3>
          </div>
          <EmptyState
            icon={<Presentation className="h-7 w-7" />}
            title="Henüz sınıf oluşturulmadı"
            description="Sınıf yönetimi özelliği bu aşamada aktif değildir. Tam sürümde sınıflarınızı oluşturabilir, öğrencilerinizi davet edebilir ve performanslarını takip edebilirsiniz."
          />
        </Card>

        <div className="flex items-start gap-3 rounded-xl bg-navy-50 border border-navy-100 px-4 py-3">
          <Info className="h-5 w-5 text-navy-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-navy-700 font-medium">Bu bir prototip panelidir</p>
            <p className="text-sm text-navy-500 mt-1 leading-relaxed">
              Öğretmen paneli şu anda temel bir arayüz sunmaktadır. Sınıf yönetimi,
              soru ekleme ve öğrenci raporları tam sürümde eklenecektir.
            </p>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
