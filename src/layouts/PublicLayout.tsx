import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Nasıl Çalışır', href: '/#how-it-works' },
    { label: 'Programlar', href: '/#programs' },
    { label: 'Hatalar', href: '/#mistakes' },
    { label: 'SSS', href: '/#faq' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-navy-100">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-navy-900">Kubik</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                <UserPlus className="h-4 w-4" />
                Üye Ol
              </Button>
            </div>

            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-navy-100 bg-white animate-slide-down">
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
              <div className="pt-3 border-t border-navy-100 flex flex-col gap-2">
                <Button variant="outline" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                  <LogIn className="h-4 w-4" />
                  Giriş Yap
                </Button>
                <Button variant="primary" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
                  <UserPlus className="h-4 w-4" />
                  Üye Ol
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-navy-950 text-navy-200">
        <div className="container-page py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Kubik</span>
              </div>
              <p className="text-sm text-navy-300 max-w-xs">
                Öğrencilerin hatalarından öğrenerek ilerledikleri Türk eğitim platformu.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#how-it-works" className="hover:text-white transition-colors">Nasıl Çalışır</a></li>
                <li><a href="/#programs" className="hover:text-white transition-colors">Programlar</a></li>
                <li><a href="/#mistakes" className="hover:text-white transition-colors">Hata Takibi</a></li>
                <li><a href="/#faq" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Sınavlar</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#programs" className="hover:text-white transition-colors">LGS Hazırlık</a></li>
                <li><a href="/#programs" className="hover:text-white transition-colors">YKS Hazırlık</a></li>
                <li><a href="/#programs" className="hover:text-white transition-colors">Ortaokul Destek</a></li>
                <li><a href="/#programs" className="hover:text-white transition-colors">Lise Destek</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">İletişim</h4>
              <ul className="space-y-2 text-sm text-navy-300">
                <li className="flex items-center gap-2">
                  <span className="text-navy-400">E-posta:</span>
                  <span className="text-navy-300">[iletişim e-postası yakında]</span>
                </li>
                <li className="text-navy-400 text-xs pt-2">
                  Bu bir prototip sürümüdür. İletişim bilgileri yakında eklenecektir.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-navy-400">
              © {new Date().getFullYear()} Kubik. Tüm hakları saklıdır.
            </p>
            <p className="text-xs text-navy-500">
              Bu platform bir eğitim prototipidir. İçerikler örnek niteliğindedir.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
