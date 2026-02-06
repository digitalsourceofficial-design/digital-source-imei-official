import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Smartphone, Hash, MessageCircle } from 'lucide-react';
import { DEVICE_BRANDS } from '@/lib/types';
import { orderFormSchema, type OrderFormValues } from '@/lib/validation';
import type { OrderFormData } from '@/lib/types';

interface DataInputProps {
  formData: OrderFormData;
  onUpdate: (data: Partial<OrderFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DataInput({ formData, onUpdate, onNext, onBack }: DataInputProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema.omit({ agreed: true })),
    defaultValues: {
      imei: formData.imei || '',
      brand: formData.brand || '',
      model: formData.model || '',
      whatsapp: formData.whatsapp || '',
      referral_code: formData.referral_code || '',
    },
  });

  const brand = watch('brand');

  const onSubmit = (data: OrderFormValues) => {
    onUpdate(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Input Data Device</h2>
        <p className="mt-2 text-muted-foreground">
          Masukkan informasi IMEI dan device Anda
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-6">
        {/* IMEI Input */}
        <div className="space-y-2">
          <Label htmlFor="imei" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Nomor IMEI
          </Label>
          <Input
            id="imei"
            placeholder="Contoh: 123456789012345"
            maxLength={15}
            {...register('imei')}
          />
          {errors.imei && (
            <p className="text-sm text-destructive">{errors.imei.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            IMEI terdiri dari 15 digit angka. Ketik *#06# di ponsel untuk melihat IMEI.
          </p>
        </div>

        {/* Brand Select */}
        <div className="space-y-2">
          <Label htmlFor="brand" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Merek Device
          </Label>
          <Select
            value={brand}
            onValueChange={(value) => setValue('brand', value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih merek device" />
            </SelectTrigger>
            <SelectContent>
              {DEVICE_BRANDS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brand && (
            <p className="text-sm text-destructive">{errors.brand.message}</p>
          )}
        </div>

        {/* Model Input */}
        <div className="space-y-2">
          <Label htmlFor="model">Tipe Device</Label>
          <Input
            id="model"
            placeholder="Contoh: iPhone 14 Pro Max"
            {...register('model')}
          />
          {errors.model && (
            <p className="text-sm text-destructive">{errors.model.message}</p>
          )}
        </div>

        {/* WhatsApp Input */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Nomor WhatsApp
          </Label>
          <Input
            id="whatsapp"
            placeholder="Contoh: 08123456789"
            {...register('whatsapp')}
          />
          {errors.whatsapp && (
            <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Notifikasi status pesanan akan dikirim ke nomor ini.
          </p>
        </div>

        {/* Referral Code (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="referral_code">Kode Referral (Opsional)</Label>
          <Input
            id="referral_code"
            placeholder="Masukkan kode referral jika ada"
            {...register('referral_code')}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button type="submit" className="flex-1">
            Lanjutkan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
