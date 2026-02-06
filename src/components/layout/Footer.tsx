import { Smartphone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompany } from '@/context/company-context';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { company } = useCompany();

  return (
    <footer className="border-t bg-primary text-primary-foreground min-h-[200px]">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>

              <span className="inline-block min-w-[180px] text-lg font-bold">
                {company?.name ?? '\u00A0'}
              </span>
            </div>

            <p className="text-sm text-primary-foreground/80 min-h-[40px]">
              Layanan unblock IMEI terpercaya dengan proses cepat, aman, dan transparan.
            </p>
          </div>

          {/* Menu */}
          <div className="space-y-4">
            <h3 className="font-semibold">Menu</h3>
            <nav className="flex flex-col gap-2 text-sm">
              {['/', '/layanan', '/lacak', '/referral'].map((path, i) => (
                <Link
                  key={i}
                  to={path}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {['Beranda', 'Layanan', 'Lacak Pesanan', 'Referral'][i]}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Hubungi Kami</h3>

            <div className="flex items-center gap-2 text-sm text-primary-foreground/80 min-h-[20px]">
              <MessageCircle className="h-4 w-4" />
              <span>
                {company?.whatsapp ? `WhatsApp: ${company.whatsapp}` : '\u00A0'}
              </span>
            </div>

            <p className="text-sm text-primary-foreground/80 min-h-[20px]">
              {company?.schedule ?? '\u00A0'}
            </p>

            <p className="text-sm text-primary-foreground/80 min-h-[20px]">
              {company?.address ?? '\u00A0'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60 min-h-[24px]">
          © {currentYear} {company?.copyright ?? '\u00A0'}
        </div>
      </div>
    </footer>
  );
}
