import { type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, LogIn, Menu, X, MapPin, Phone, Mail, Instagram } from 'lucide-react';

interface PublicLayoutProps {
  children: ReactNode;
}

// Dershane iletişim bilgileri — doldurulan alanlar footer'da otomatik görünür.
const CONTACT = {
  address: '',
  phone: '',
  email: '',
  instagram: '',
};

const navLinks = [
  { label: 'Paneller', href: '/#paneller' },
  { label: 'Yapay Zeka', href: '/#yapay-zeka' },
  { label: 'Nasıl Çalışır', href: '/#platform' },
  { label: 'Programlar', href: '/#programlar' },
  { label: 'SSS', href: '/#sss' },
];

export function KubikLogo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-navy-900 shadow-md">
        <Box className="h-5 w-5 text-white" strokeWidth={2.25} />
      </span>
      <span className="leading-none">
        <span className={`block text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>Kübik</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.2em] ${light ? 'text-brand-300' : 'text-brand-600'}`}>
          Dijital Akademi
        </span>
      </span>
    </span>
  );
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const hasContact = Object.values(CONTACT).some(Boolean);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-navy-100">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between">
            <Link to="/">
              <KubikLogo />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-navy-700 hover:bg-navy-50 rounded-lg transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </button>
              <a
                href="/#paneller"
                className="inline-flex items-center h-9 px-4 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
              >
                Demoyu İncele
              </a>
            </div>

            <button
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-navy-100 bg-white animate-slide-down">
            <div className="container-page py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-50 rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-navy-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="h-11 rounded-xl border border-navy-200 text-sm font-semibold text-navy-800"
                >
                  Giriş Yap
                </button>
                <a
                  href="/#paneller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-11 rounded-xl bg-navy-900 text-white text-sm font-semibold flex items-center justify-center"
                >
                  Demoyu İncele
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-navy-950 text-navy-300">
        <div className="container-page py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4 lg:col-span-1">
              <KubikLogo light />
              <p className="text-sm text-navy-400 max-w-xs leading-relaxed">
                Kübik Dershanesi'nin öğrenci, öğretmen, veli ve yönetimi buluşturan yapay zeka destekli dijital eğitim
                platformu.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Programlar</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/#programlar" className="hover:text-white transition-colors">Ortaokul Destek (5–7)</a></li>
                <li><a href="/#programlar" className="hover:text-white transition-colors">LGS Hazırlık (8)</a></li>
                <li><a href="/#programlar" className="hover:text-white transition-colors">Lise Destek (9–11)</a></li>
                <li><a href="/#programlar" className="hover:text-white transition-colors">YKS Hazırlık (12 & Mezun)</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Giriş</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Öğrenci Girişi</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Veli Girişi</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Öğretmen Girişi</Link></li>
              </ul>
              {hasContact && (
                <ul className="mt-6 space-y-2.5 text-sm">
                  {CONTACT.address && (
                    <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" />{CONTACT.address}</li>
                  )}
                  {CONTACT.phone && (
                    <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 mt-0.5" />{CONTACT.phone}</li>
                  )}
                  {CONTACT.email && (
                    <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 mt-0.5" />{CONTACT.email}</li>
                  )}
                  {CONTACT.instagram && (
                    <li className="flex gap-2"><Instagram className="h-4 w-4 shrink-0 mt-0.5" />{CONTACT.instagram}</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-navy-500">© {new Date().getFullYear()} Kübik Dijital Akademi. Tüm hakları saklıdır.</p>
            <p className="text-xs text-navy-500">KVKK · Gizlilik Politikası</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
