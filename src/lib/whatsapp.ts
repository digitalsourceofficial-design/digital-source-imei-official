// WhatsApp integration utilities
// Simulasi - redirect ke wa.me dengan template pesan

import type { Order } from './types';
import { ORDER_STATUS_LABELS } from './types';

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta',
  };
  return date.toLocaleDateString('id-ID', options) + ' WIB';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderConfirmationMessage(order: Order, trackingUrl: string): string {
  return `🎉 *PESANAN BERHASIL DIBUAT*

📋 *Detail Pesanan:*
━━━━━━━━━━━━━━━━
Nomor Pesanan: *${order.order_id}*
IMEI: ${order.imei}
Device: ${order.brand} ${order.model}
Layanan: ${order.layanan_nama}
Harga: ${formatCurrency(order.harga)}
━━━━━━━━━━━━━━━━

📍 *Status:* ${ORDER_STATUS_LABELS[order.status]}
🕐 *Waktu:* ${formatTimestamp(order.created_at)}

🔗 *Lacak Pesanan:*
${trackingUrl}

Terima kasih telah menggunakan layanan kami! 🙏`;
}

export function generateStatusUpdateMessage(order: Order, trackingUrl: string, failureReason?: string): string {
  const latestTimeline = order.timeline[order.timeline.length - 1];
  
   // Special message for failed orders
   if (order.status === 'gagal') {
     return `⚠️ *PESANAN GAGAL DIPROSES*
 
 📋 *Nomor Pesanan:* ${order.order_id}
 ━━━━━━━━━━━━━━━━
 
 📍 *Status:* Gagal
 🕐 *Waktu Update:* ${formatTimestamp(latestTimeline.timestamp)}
 
 IMEI: ${order.imei}
 Device: ${order.brand} ${order.model}
 
 ❌ *Alasan Kegagalan:*
 ${failureReason || order.failure_reason || 'Tidak tersedia'}
 
 🔗 *Detail Pesanan:*
 ${trackingUrl}
 
 Silakan hubungi kami untuk informasi lebih lanjut. 🙏`;
   }
 
  return `📢 *UPDATE STATUS PESANAN*

📋 *Nomor Pesanan:* ${order.order_id}
━━━━━━━━━━━━━━━━

📍 *Status Baru:* ${ORDER_STATUS_LABELS[order.status]}
🕐 *Waktu Update:* ${formatTimestamp(latestTimeline.timestamp)}

IMEI: ${order.imei}
Device: ${order.brand} ${order.model}

🔗 *Lacak Pesanan:*
${trackingUrl}

Terima kasih! 🙏`;
}

export function generatePaymentConfirmationMessage(order: Order): string {
  return `💳 *KONFIRMASI PEMBAYARAN*

📋 *Detail Pesanan:*
━━━━━━━━━━━━━━━━
Nomor Pesanan: *${order.order_id}*
IMEI: ${order.imei}
Device: ${order.brand} ${order.model}
Layanan: ${order.layanan_nama}
━━━━━━━━━━━━━━━━

💰 *Total Pembayaran:* ${formatCurrency(order.harga)}

Saya sudah melakukan pembayaran untuk pesanan di atas.
Mohon diproses segera. Terima kasih! 🙏`;
}

export function generateNewOrderMessage(order: Order): string {
  const trackingUrl = `${window.location.origin}/lacak?order=${order.order_id}`;
  
  return `🆕 *PESANAN BARU*

📋 *Detail Pesanan:*
━━━━━━━━━━━━━━━━
Nomor Pesanan: *${order.order_id}*
IMEI: ${order.imei}
Device: ${order.brand} ${order.model}
Layanan: ${order.layanan_nama}
Harga: ${formatCurrency(order.harga)}
━━━━━━━━━━━━━━━━

📞 *WhatsApp Customer:* ${order.whatsapp}
🕐 *Waktu Order:* ${formatTimestamp(order.created_at)}

🔗 *Lacak:* ${trackingUrl}

*Bukti pembayaran sudah di-upload.*`;
}

export function openWhatsApp(phoneNumber: string, message: string): void {
  // Remove non-numeric characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  // Remove leading + if exists
  const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber;
  
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  
  window.open(url, '_blank');
}

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const { getAdminWhatsApp } = await import('./storage');
  const adminWa = await getAdminWhatsApp();
  const trackingUrl = `${window.location.origin}/lacak?order=${order.order_id}`;
  const message = generateOrderConfirmationMessage(order, trackingUrl);
  openWhatsApp(adminWa, message);
}

export function sendStatusUpdate(order: Order): void {
  const trackingUrl = `${window.location.origin}/lacak?order=${order.order_id}`;
  const message = generateStatusUpdateMessage(order, trackingUrl);
  openWhatsApp(order.whatsapp, message);
}

export async function sendPaymentConfirmation(order: Order): Promise<void> {
  const { getAdminWhatsApp } = await import('./storage');
  const adminWa = await getAdminWhatsApp();
  const message = generatePaymentConfirmationMessage(order);
  openWhatsApp(adminWa, message);
}

export async function openAdminWhatsApp(customMessage?: string): Promise<void> {
  const { getAdminWhatsApp } = await import('./storage');
  const adminWa = await getAdminWhatsApp();
  const message = customMessage || 'Halo, saya ingin bertanya tentang layanan IMEI Unblock.';
  openWhatsApp(adminWa, message);
}
