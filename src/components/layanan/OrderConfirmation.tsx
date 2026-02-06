import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Smartphone, Hash, MessageCircle, Package } from 'lucide-react';
import type { OrderFormData } from '@/lib/types';
import { formatCurrency } from '@/lib/whatsapp';
import { useState } from 'react';

interface OrderConfirmationProps {
  formData: OrderFormData;
  onNext: () => void;
  onBack: () => void;
}

export function OrderConfirmation({ formData, onNext, onBack }: OrderConfirmationProps) {
  const [agreed, setAgreed] = useState(formData.agreed || false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (!agreed) {
      setError('Anda harus menyetujui syarat dan ketentuan untuk melanjutkan.');
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Konfirmasi Pesanan</h2>
        <p className="mt-2 text-muted-foreground">
          Periksa kembali data pesanan Anda sebelum melanjutkan
        </p>
      </div>

      <Card className="mx-auto max-w-lg">
        <CardContent className="p-6 space-y-6">
          {/* Service Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              Layanan
            </div>
            <div className="pl-6 space-y-1">
              <p className="font-semibold text-foreground">{formData.layanan?.nama}</p>
              <p className="text-sm text-muted-foreground">
                Estimasi: {formData.layanan?.estimasi}
              </p>
              <p className="text-sm text-muted-foreground">{formData.layanan?.garansi}</p>
            </div>
          </div>

          <Separator />

          {/* Device Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              Device
            </div>
            <div className="pl-6 space-y-1">
              <p className="font-semibold text-foreground">
                {formData.brand} {formData.model}
              </p>
            </div>
          </div>

          <Separator />

          {/* IMEI */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Hash className="h-4 w-4" />
              IMEI
            </div>
            <div className="pl-6">
              <p className="font-mono font-semibold text-foreground">{formData.imei}</p>
            </div>
          </div>

          <Separator />

          {/* WhatsApp */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </div>
            <div className="pl-6">
              <p className="font-semibold text-foreground">{formData.whatsapp}</p>
              <p className="text-xs text-muted-foreground">
                Notifikasi akan dikirim ke nomor ini
              </p>
            </div>
          </div>

          {formData.referral_code && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">
                  Kode Referral
                </div>
                <div className="pl-6">
                  <p className="font-mono font-semibold text-foreground">
                    {formData.referral_code}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between py-2">
            <span className="text-lg font-medium text-foreground">Total Pembayaran</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(formData.layanan?.harga || 0)}
            </span>
          </div>

          <Separator />

          {/* Agreement */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => {
                setAgreed(checked as boolean);
                if (checked) setError(null);
              }}
            />
            <Label htmlFor="agreement" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              Saya menyetujui syarat dan ketentuan layanan, serta memahami bahwa proses 
              unblock IMEI memiliki tingkat keberhasilan {formData.layanan?.success_rate}%.
            </Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-2">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Lanjutkan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
