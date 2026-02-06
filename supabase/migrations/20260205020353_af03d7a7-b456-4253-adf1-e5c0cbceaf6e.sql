-- Create enum for order status
CREATE TYPE order_status AS ENUM (
  'pesanan_dibuat',
  'pembayaran_diterima',
  'dalam_proses',
  'berhasil_unblock',
  'selesai'
);

-- Create enum for payment method
CREATE TYPE payment_method AS ENUM ('bank', 'ewallet', 'qris');

-- Create enum for referral history status
CREATE TYPE referral_history_status AS ENUM ('pending', 'paid');

-- Services table
CREATE TABLE public.services (
  service_id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,
  estimasi TEXT NOT NULL,
  garansi TEXT NOT NULL,
  garansi_bulan INTEGER,
  success_rate INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  order_id TEXT PRIMARY KEY,
  imei TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  layanan_id TEXT NOT NULL REFERENCES public.services(service_id),
  layanan_nama TEXT NOT NULL,
  harga INTEGER NOT NULL,
  whatsapp TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pesanan_dibuat',
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  referral_code TEXT,
  payment_proof TEXT,
  payment_method payment_method,
  notification_sent BOOLEAN DEFAULT false,
  garansi_bulan INTEGER,
  unblock_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referrals table
CREATE TABLE public.referrals (
  referral_code TEXT PRIMARY KEY,
  total_user INTEGER NOT NULL DEFAULT 0,
  total_komisi INTEGER NOT NULL DEFAULT 0,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Site settings table (single row for all settings)
CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payment JSONB NOT NULL DEFAULT '{}'::jsonb,
  referral JSONB NOT NULL DEFAULT '{}'::jsonb,
  company JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for services (users can see available services)
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

-- Public insert/update/delete for services (admin via anon key for MVP)
CREATE POLICY "Services can be managed"
  ON public.services FOR ALL
  USING (true)
  WITH CHECK (true);

-- Public read access for orders (users can track their orders)
CREATE POLICY "Orders are viewable by everyone"
  ON public.orders FOR SELECT
  USING (true);

-- Public insert/update for orders
CREATE POLICY "Orders can be managed"
  ON public.orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- Public read access for referrals
CREATE POLICY "Referrals are viewable by everyone"
  ON public.referrals FOR SELECT
  USING (true);

-- Public insert/update for referrals
CREATE POLICY "Referrals can be managed"
  ON public.referrals FOR ALL
  USING (true)
  WITH CHECK (true);

-- Public read access for site settings
CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings FOR SELECT
  USING (true);

-- Public update for site settings
CREATE POLICY "Site settings can be managed"
  ON public.site_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default services
INSERT INTO public.services (service_id, nama, harga, estimasi, garansi, garansi_bulan, success_rate, active)
VALUES 
  ('basic', 'Basic', 150000, '5-7 hari kerja', 'Garansi 1 bulan', 1, 85, true),
  ('priority', 'Priority', 300000, '2-3 hari kerja', 'Garansi 3 bulan', 3, 92, true),
  ('express', 'Express', 500000, '1x24 jam', 'Garansi 6 bulan', 6, 98, true);

-- Insert default site settings
INSERT INTO public.site_settings (id, payment, referral, company)
VALUES (
  1,
  '{
    "bank_accounts": [
      {"id": "1", "bank": "BCA", "nomor": "1234567890", "atas_nama": "PT IMEI Unblock Indonesia", "active": true},
      {"id": "2", "bank": "Mandiri", "nomor": "0987654321", "atas_nama": "PT IMEI Unblock Indonesia", "active": true},
      {"id": "3", "bank": "BRI", "nomor": "5678901234", "atas_nama": "PT IMEI Unblock Indonesia", "active": true},
      {"id": "4", "bank": "BNI", "nomor": "4321098765", "atas_nama": "PT IMEI Unblock Indonesia", "active": true}
    ],
    "ewallets": [
      {"id": "1", "nama": "GoPay", "nomor": "081234567890", "active": true},
      {"id": "2", "nama": "OVO", "nomor": "081234567890", "active": true},
      {"id": "3", "nama": "DANA", "nomor": "081234567890", "active": true},
      {"id": "4", "nama": "ShopeePay", "nomor": "081234567890", "active": true}
    ],
    "qris": {"enabled": true}
  }'::jsonb,
  '{"commission_percentage": 10, "min_payout": 100000, "enabled": true}'::jsonb,
  '{"name": "IMEI Unblock", "whatsapp": "+62 812-3456-7890", "copyright": "IMEI Unblock. Semua hak dilindungi.", "schedule": "Senin - Jumat: 09:00 - 18:00 WIB"}'::jsonb
);