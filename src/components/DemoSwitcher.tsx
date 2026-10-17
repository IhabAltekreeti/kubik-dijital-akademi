import { useNavigate } from 'react-router-dom';
import { Repeat } from 'lucide-react';
import type { UserRole } from '@/types';
import { loginAsDemo, loginAsDemoStudentByEmail } from '@/services/authService';

const items: { role: UserRole; label: string; path: string }[] = [
  { role: 'student', label: 'Öğrenci', path: '/app' },
  { role: 'parent', label: 'Veli', path: '/parent' },
  { role: 'teacher', label: 'Öğretmen', path: '/teacher' },
  { role: 'admin', label: 'Yönetim', path: '/admin' },
];

/** Sunum kolaylığı: demo hesaplar arasında tek tıkla geçiş (sadece demo kullanıcılarda görünür). */
export default function DemoSwitcher({ current }: { current: UserRole }) {
  const navigate = useNavigate();

  function go(role: UserRole, path: string) {
    if (role === current) return;
    // Veli olarak Ayşe'nin annesi Fatma Yılmaz açılır
    const r = role === 'parent' ? loginAsDemoStudentByEmail('veli.ayse@kubik.com') : loginAsDemo(role);
    if (r.success) navigate(path);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-dashed border-navy-300 bg-white p-1" title="Sadece demo içindir">
      <span className="hidden sm:inline-flex items-center gap-1 px-1.5 text-[11px] font-medium text-navy-400">
        <Repeat className="h-3 w-3" />
        Demo:
      </span>
      {items.map((it) => (
        <button
          key={it.role}
          onClick={() => go(it.role, it.path)}
          className={[
            'h-7 px-2.5 rounded-lg text-xs font-medium transition-colors',
            it.role === current ? 'bg-navy-900 text-white' : 'text-navy-600 hover:bg-navy-50',
          ].join(' ')}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
