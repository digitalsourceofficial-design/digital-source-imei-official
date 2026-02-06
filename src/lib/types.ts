// Types untuk IMEI Unblock Service
// Struktur data siap migrate ke Supabase

export interface TimelineItem {
  status: OrderStatus;
  timestamp: string; // ISO string
}

export type OrderStatus = 
  | 'pesanan_dibuat'
  | 'pembayaran_diterima'
  | 'dalam_proses'
  | 'berhasil_unblock'
   | 'selesai'
   | 'gagal';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pesanan_dibuat: 'Pesanan Dibuat',
  pembayaran_diterima: 'Pembayaran Diterima',
  dalam_proses: 'IMEI Dalam Proses Unblock',
  berhasil_unblock: 'IMEI Berhasil Di-unblock',
  selesai: 'Pesanan Selesai',
   gagal: 'Gagal',
};

export interface Order {
  order_id: string;
  imei: string;
  brand: string;
  model: string;
  layanan_id: string;
  layanan_nama: string;
  harga: number;
  whatsapp: string;
  status: OrderStatus;
  timeline: TimelineItem[];
  referral_code?: string;
  payment_proof?: string; // base64 image
  payment_method?: PaymentMethod;
  notification_sent?: boolean;
  garansi_bulan?: number; // service duration in months
  unblock_date?: string; // ISO string - when IMEI was unblocked
  expiration_date?: string; // ISO string - calculated expiration
   failure_reason?: string; // reason for failure if status is gagal
  created_at: string; // ISO string
}

export interface Service {
  service_id: string;
  nama: string;
  harga: number;
  estimasi: string; // e.g., "1-3 hari kerja"
  garansi: string; // e.g., "Garansi 30 hari"
  garansi_bulan?: number; // duration in months for expiration calculation
  success_rate: number; // percentage 0-100
  active: boolean;
}

export interface ReferralHistory {
  order_id: string;
  tanggal: string; // ISO string
  komisi: number;
  status: 'pending' | 'paid';
}

export interface Referral {
  referral_code: string;
  total_user: number;
  total_komisi: number;
  history: ReferralHistory[];
}

export interface AdminSession {
  logged_in: boolean;
  timestamp: string; // ISO string
}

// Device brands for dropdown
export const DEVICE_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'OPPO',
  'Vivo',
  'Realme',
  'Huawei',
  'OnePlus',
  'Google',
  'Sony',
  'Lainnya',
] as const;

export type DeviceBrand = typeof DEVICE_BRANDS[number];

// Payment methods
export type PaymentMethod = 'bank' | 'ewallet' | 'qris';

export interface BankAccount {
  id: string;
  bank: string;
  nomor: string;
  atas_nama: string;
  active: boolean;
}

export interface EWallet {
  id: string;
  nama: string;
  nomor: string;
  active: boolean;
}

export interface QRISConfig {
  enabled: boolean;
  image?: string; // base64 image
}

export interface PaymentSettings {
  bank_accounts: BankAccount[];
  ewallets: EWallet[];
  qris: QRISConfig;
}

export interface ReferralSettings {
  commission_percentage: number; // 0-100
  min_payout: number;
  enabled: boolean;
}

export interface CompanySettings {
  name: string;
  whatsapp: string;
  copyright: string;
  schedule: string;
  address?: string;
}

export interface SiteSettings {
  payment: PaymentSettings;
  referral: ReferralSettings;
  company: CompanySettings;
}

// Form data for wizard
export interface OrderFormData {
  layanan?: Service;
  imei: string;
  brand: string;
  model: string;
  whatsapp: string;
  referral_code?: string;
  agreed: boolean;
  payment_proof?: string;
  payment_method?: PaymentMethod;
}
