// Local Storage utilities untuk IMEI Unblock Service
// Now connected to Supabase

import { supabase } from '@/integrations/supabase/client';
import type { 
  Order, 
  Service, 
  Referral, 
  AdminSession, 
  OrderStatus, 
  SiteSettings,
  PaymentSettings,
  ReferralSettings,
  CompanySettings
} from './types';

// Keep admin session in localStorage (no user auth needed)
const STORAGE_KEYS = {
  ADMIN_SESSION: 'imei_unblock_admin_session',
} as const;

// ===== ORDERS =====
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return (data || []).map(mapDbOrderToOrder);
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();
  
  if (error || !data) {
    return undefined;
  }
  
  return mapDbOrderToOrder(data);
}

export async function getOrderByImei(imei: string): Promise<Order | undefined> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('imei', imei)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    return undefined;
  }
  
  return mapDbOrderToOrder(data);
}

export async function saveOrder(order: Order): Promise<void> {
  const dbOrder = mapOrderToDbOrder(order);
  
  const { error } = await supabase
    .from('orders')
    .upsert([dbOrder], { onConflict: 'order_id' });
  
  if (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, failureReason?: string): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order) return undefined;
  
  const now = new Date();
  const newTimeline = [...order.timeline, { status, timestamp: now.toISOString() }];
  
  const updates: Record<string, unknown> = {
    status,
    timeline: newTimeline,
  };
  
  // If status is "berhasil_unblock", calculate expiration date
  if (status === 'berhasil_unblock' && order.garansi_bulan) {
    updates.unblock_date = now.toISOString();
    const expirationDate = new Date(now);
    expirationDate.setMonth(expirationDate.getMonth() + order.garansi_bulan);
    updates.expiration_date = expirationDate.toISOString();
  }
   
   // If status is "gagal", add failure reason
   if (status === 'gagal' && failureReason) {
     updates.failure_reason = failureReason;
   }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('order_id', orderId)
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error updating order status:', error);
    return undefined;
  }
  
  return mapDbOrderToOrder(data);
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IME-${timestamp}-${random}`;
}

export async function deleteOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('order_id', orderId);
  
  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// ===== SERVICES =====
export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('harga', { ascending: true });
  
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  
  return (data || []).map(mapDbServiceToService);
}

export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('harga', { ascending: true });
  
  if (error) {
    console.error('Error fetching active services:', error);
    return [];
  }
  
  return (data || []).map(mapDbServiceToService);
}

export async function saveService(service: Service): Promise<void> {
  const { error } = await supabase
    .from('services')
    .upsert([{
      service_id: service.service_id,
      nama: service.nama,
      harga: service.harga,
      estimasi: service.estimasi,
      garansi: service.garansi,
      garansi_bulan: service.garansi_bulan,
      success_rate: service.success_rate,
      active: service.active,
    }], { onConflict: 'service_id' });
  
  if (error) {
    console.error('Error saving service:', error);
    throw error;
  }
}

export async function deleteService(serviceId: string): Promise<void> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('service_id', serviceId);
  
  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

// ===== REFERRALS =====
export async function getReferrals(): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
  
  return (data || []).map(mapDbReferralToReferral);
}

export async function getReferralByCode(code: string): Promise<Referral | undefined> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referral_code', code)
    .single();
  
  if (error || !data) {
    return undefined;
  }
  
  return mapDbReferralToReferral(data);
}

export async function saveReferral(referral: Referral): Promise<void> {
  const { error } = await supabase
    .from('referrals')
    .upsert([{
      referral_code: referral.referral_code,
      total_user: referral.total_user,
      total_komisi: referral.total_komisi,
      history: JSON.parse(JSON.stringify(referral.history)),
    }], { onConflict: 'referral_code' });
  
  if (error) {
    console.error('Error saving referral:', error);
    throw error;
  }
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function deleteReferral(referralCode: string): Promise<void> {
  const { error } = await supabase
    .from('referrals')
    .delete()
    .eq('referral_code', referralCode);
  
  if (error) {
    console.error('Error deleting referral:', error);
    throw error;
  }
}

export async function addReferralUsage(referralCode: string, orderId: string, komisi: number): Promise<void> {
  const referral = await getReferralByCode(referralCode);
  if (referral) {
    referral.total_user += 1;
    referral.total_komisi += komisi;
    referral.history.push({
      order_id: orderId,
      tanggal: new Date().toISOString(),
      komisi,
      status: 'pending',
    });
    await saveReferral(referral);
  }
}

// ===== ADMIN SESSION =====
export function getAdminSession(): AdminSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(session: AdminSession): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
}

export function clearAdminSession(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
}

export function isAdminLoggedIn(): boolean {
  const session = getAdminSession();
  if (!session?.logged_in) return false;
  
  // Session expires after 24 hours
  const sessionTime = new Date(session.timestamp).getTime();
  const now = Date.now();
  const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    clearAdminSession();
    return false;
  }
  
  return true;
}

// Admin credentials (hardcoded for MVP)
export const ADMIN_CREDENTIALS = {
  username: 'helpadmin',
  password: 'helpadmin123',
};

// ===== SITE SETTINGS =====
const DEFAULT_SITE_SETTINGS: SiteSettings = {
  payment: {
    bank_accounts: [],
    ewallets: [],
    qris: { enabled: false },
  },
  referral: {
    commission_percentage: 10,
    min_payout: 100000,
    enabled: true,
  },
  company: {
    name: 'IMEI Unblock',
    whatsapp: '+62 812-3456-7890',
    copyright: 'IMEI Unblock. Semua hak dilindungi.',
    schedule: 'Senin - Jumat: 09:00 - 18:00 WIB',
  },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();
  
  if (error || !data) {
    console.error('Error fetching site settings:', error);
    return DEFAULT_SITE_SETTINGS;
  }
  
  return {
    payment: data.payment as unknown as PaymentSettings,
    referral: data.referral as unknown as ReferralSettings,
    company: data.company as unknown as CompanySettings,
  };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .update({
      payment: JSON.parse(JSON.stringify(settings.payment)),
      referral: JSON.parse(JSON.stringify(settings.referral)),
      company: JSON.parse(JSON.stringify(settings.company)),
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  
  if (error) {
    console.error('Error saving site settings:', error);
    throw error;
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const settings = await getSiteSettings();
  return settings.payment;
}

export async function savePaymentSettings(payment: PaymentSettings): Promise<void> {
  const settings = await getSiteSettings();
  settings.payment = payment;
  await saveSiteSettings(settings);
}

export async function getReferralSettings(): Promise<ReferralSettings> {
  const settings = await getSiteSettings();
  return settings.referral;
}

export async function saveReferralSettings(referral: ReferralSettings): Promise<void> {
  const settings = await getSiteSettings();
  settings.referral = referral;
  await saveSiteSettings(settings);
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const settings = await getSiteSettings();
  return settings.company;
}

export async function saveCompanySettings(company: CompanySettings): Promise<void> {
  const settings = await getSiteSettings();
  settings.company = company;
  await saveSiteSettings(settings);
}

// Get admin WhatsApp number (cleaned for wa.me)
export async function getAdminWhatsApp(): Promise<string> {
  const company = await getCompanySettings();
  return company.whatsapp.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

// ===== MAPPERS =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbOrderToOrder(dbOrder: any): Order {
  return {
    order_id: dbOrder.order_id,
    imei: dbOrder.imei,
    brand: dbOrder.brand,
    model: dbOrder.model,
    layanan_id: dbOrder.layanan_id,
    layanan_nama: dbOrder.layanan_nama,
    harga: dbOrder.harga,
    whatsapp: dbOrder.whatsapp,
    status: dbOrder.status as OrderStatus,
    timeline: dbOrder.timeline || [],
    referral_code: dbOrder.referral_code || undefined,
    payment_proof: dbOrder.payment_proof || undefined,
    payment_method: dbOrder.payment_method || undefined,
    notification_sent: dbOrder.notification_sent || false,
    garansi_bulan: dbOrder.garansi_bulan || undefined,
    unblock_date: dbOrder.unblock_date || undefined,
    expiration_date: dbOrder.expiration_date || undefined,
     failure_reason: dbOrder.failure_reason || undefined,
    created_at: dbOrder.created_at,
  };
}

function mapOrderToDbOrder(order: Order) {
  return {
    order_id: order.order_id,
    imei: order.imei,
    brand: order.brand,
    model: order.model,
    layanan_id: order.layanan_id,
    layanan_nama: order.layanan_nama,
    harga: order.harga,
    whatsapp: order.whatsapp,
    status: order.status,
    timeline: JSON.parse(JSON.stringify(order.timeline)),
    referral_code: order.referral_code || null,
    payment_proof: order.payment_proof || null,
    payment_method: order.payment_method || null,
    notification_sent: order.notification_sent || false,
    garansi_bulan: order.garansi_bulan || null,
    unblock_date: order.unblock_date || null,
    expiration_date: order.expiration_date || null,
     failure_reason: order.failure_reason || null,
    created_at: order.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbServiceToService(dbService: any): Service {
  return {
    service_id: dbService.service_id,
    nama: dbService.nama,
    harga: dbService.harga,
    estimasi: dbService.estimasi,
    garansi: dbService.garansi,
    garansi_bulan: dbService.garansi_bulan || undefined,
    success_rate: dbService.success_rate,
    active: dbService.active,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbReferralToReferral(dbReferral: any): Referral {
  return {
    referral_code: dbReferral.referral_code,
    total_user: dbReferral.total_user,
    total_komisi: dbReferral.total_komisi,
    history: dbReferral.history || [],
  };
}
