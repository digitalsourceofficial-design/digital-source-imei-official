import { z } from 'zod';

// IMEI validation - must be exactly 15 digits
export const imeiSchema = z
  .string()
  .trim()
  .regex(/^\d{15}$/, { message: 'IMEI harus 15 digit angka' });

// WhatsApp validation - Indonesian format
export const whatsappSchema = z
  .string()
  .trim()
  .regex(/^(\+62|62|08)\d{8,12}$/, { 
    message: 'Nomor WhatsApp tidak valid. Format: +62xxx atau 08xxx' 
  });

// Normalize WhatsApp number to +62 format
export function normalizeWhatsApp(number: string): string {
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.startsWith('62')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.substring(1);
  }
  return '+62' + cleaned;
}

// Order form validation schema
export const orderFormSchema = z.object({
  imei: imeiSchema,
  brand: z.string().min(1, { message: 'Pilih merek device' }),
  model: z.string().trim().min(1, { message: 'Masukkan tipe device' }).max(100),
  whatsapp: whatsappSchema,
  referral_code: z.string().optional(),
  agreed: z.literal(true, { 
    errorMap: () => ({ message: 'Anda harus menyetujui syarat dan ketentuan' }) 
  }),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

// Validate IMEI format
export function validateImei(imei: string): { valid: boolean; message?: string } {
  const result = imeiSchema.safeParse(imei);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, message: result.error.errors[0]?.message };
}

// Validate WhatsApp format
export function validateWhatsApp(number: string): { valid: boolean; message?: string } {
  const result = whatsappSchema.safeParse(number);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, message: result.error.errors[0]?.message };
}
