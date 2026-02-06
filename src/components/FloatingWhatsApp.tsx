import { MessageCircle } from 'lucide-react';
import { openAdminWhatsApp } from '@/lib/whatsapp';

export function FloatingWhatsApp() {
  return (
    <button
      onClick={() => openAdminWhatsApp()}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BD5A] transition-all hover:scale-110 animate-pulse-soft"
      aria-label="Hubungi via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
}
