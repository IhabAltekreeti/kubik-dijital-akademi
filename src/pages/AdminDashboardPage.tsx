import { Shield, Users, Database, Settings, Info } from 'lucide-react';
import RoleLayout from '@/layouts/RoleLayout';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

export default function AdminDashboardPage() {
  return (
    <RoleLayout
      pageTitle="Yönetici Paneli"
      pageDescription="Sistem genelini yönetin"
      role="admin"
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Yönetici Paneli</h2>
            <p className="text-sm text-navy-500 mt-1">
              Bu panel, sistem yöneticilerinin platformu izlemesi için tasarlanmıştır.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-warning-50 border border-warning-100 px-4 py-3">
          <Shield className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-warning-700 font-medium">Yerel demo erişimi</p>
            <p className="text-sm text-warning-600 mt-1 leading-relaxed">
              Bu yönetici erişimi yalnızca yerel prototip içindir. Üretim ortamında
              güvenli sunucu tabanlı erişim kontrolü gereklidir.
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
                <p className="text-sm text-navy-400">Toplam Kullanıcı</p>
                <p className="text-xl font-bold text-navy-900">—</p>
                <p className="text-xs text-navy-400 mt-0.5">kayıtlı</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600">
                <Database className="h-6 w-6" />
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-600">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Sistem Durumu</p>
                <p className="text-xl font-bold text-navy-900">—</p>
                <p className="text-xs text-navy-400 mt-0.5">prototip</p>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <div className="flex items-center gap-2.5 mb-4">
            <Settings className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-semibold text-navy-900">Sistem Yönetimi</h3>
          </div>
          <EmptyState
            icon={<Shield className="h-7 w-7" />}
            title="Yönetim araçları yakında"
            description="Kullanıcı yönetimi, içerik denetimi ve sistem ayarları bu aşamada aktif değildir. Tam sürümde buradan erişilebilecektir."
          />
        </Card>

        <div className="flex items-start gap-3 rounded-xl bg-navy-50 border border-navy-100 px-4 py-3">
          <Info className="h-5 w-5 text-navy-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-navy-700 font-medium">Bu bir prototip panelidir</p>
            <p className="text-sm text-navy-500 mt-1 leading-relaxed">
              Yönetici paneli şu anda temel bir arayüz sunmaktadır. Kullanıcı yönetimi,
              rol atama ve sistem izleme tam sürümde eklenecektir.
            </p>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
