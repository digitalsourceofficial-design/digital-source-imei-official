-- Add 'gagal' status to order_status enum
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'gagal';

-- Add failure_reason column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Add index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);