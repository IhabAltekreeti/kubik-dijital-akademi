import { Users, TrendingUp, BookOpen, Clock, Info } from 'lucide-react';
import RoleLayout from '@/layouts/RoleLayout';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

export default function ParentDashboardPage() {
  return (
    <RoleLayout
      pageTitle="Veli Paneli"
      pageDescription="Çocuğunuzun gelişimini takip edin"
      role="parent"
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Veli Paneli</h2>
            <p className="text-sm text-navy-500 mt-1">
              Bu panel, velilerin çocuklarının çalışma ilerlemesini takip etmesi için tasarlanmıştır.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Çalışma Süresi</p>
                <p className="text-xl font-bold text-navy-900">—</p>
                <p className="text-xs text-navy-400 mt-0.5">bu hafta</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Başarı Oranı</p>
                <p className="text-xl font-bold text-navy-900">—</p>
                <p className="text-xs text-navy-400 mt-0.5">genel</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50 text-error-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Açık Hatalar</p>
                <p className="text-xl font-bold text-navy-900">—</p>
                <p className="text-xs text-navy-400 mt-0.5">incelenmeyi bekliyor</p>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <div className="flex items-center gap-2.5 mb-4">
            <Users className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-semibold text-navy-900">Bağlı Öğrenciler</h3>
          </div>
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="Henüz bağlı öğrenci yok"
            description="Öğrenci bağlama özelliği bu aşamada aktif değildir. Tam sürümde çocuğunuzun hesabını bağlayarak ilerlemesini burada görebileceksiniz."
          />
        </Card>

        <div className="flex items-start gap-3 rounded-xl bg-navy-50 border border-navy-100 px-4 py-3">
          <Info className="h-5 w-5 text-navy-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-navy-700 font-medium">Bu bir prototip panelidir</p>
            <p className="text-sm text-navy-500 mt-1 leading-relaxed">
              Veli paneli şu anda temel bir arayüz sunmaktadır. Öğrenci bağlama,
              ilerleme raporları ve bildirimler tam sürümde eklenecektir.
            </p>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
