import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Smartphone,
  CreditCard,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/pesanan', icon: Package, label: 'Pesanan' },
  { href: '/admin/layanan', icon: Settings, label: 'Layanan' },
  { href: '/admin/referral', icon: Users, label: 'Referral' },
  { href: '/admin/pembayaran', icon: CreditCard, label: 'Pembayaran' },
  { href: '/admin/pengaturan', icon: Building2, label: 'Pengaturan' },
];

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Smartphone className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-primary">Admin</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar - Fixed position */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 w-64 h-screen bg-sidebar text-sidebar-foreground transition-transform duration-200',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header - Desktop */}
          <div className="hidden lg:flex h-16 items-center gap-2 border-b border-sidebar-border px-6 flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Smartphone className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold">Admin Dashboard</span>
          </div>

          {/* Mobile spacer for header */}
          <div className="lg:hidden h-16 flex-shrink-0" />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="border-t border-sidebar-border p-4 flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - with left margin for sidebar */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
