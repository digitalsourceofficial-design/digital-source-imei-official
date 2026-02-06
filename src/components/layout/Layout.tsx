import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Header slot (fixed height) */}
      <div className="h-16">
        <Header />
      </div>

      {/* Main content */}
      <main className="min-h-[calc(100vh-4rem-200px)]">
        {children}
      </main>

      {/* Footer slot */}
      {!hideFooter && (
        <div className="min-h-[200px]">
          <Footer />
        </div>
      )}

      {/* Floating element – OUTSIDE layout flow */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50">
        <div className="pointer-events-auto">
          <FloatingWhatsApp />
        </div>
      </div>
    </div>
  );
}
