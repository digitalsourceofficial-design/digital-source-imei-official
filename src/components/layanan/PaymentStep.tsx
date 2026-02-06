import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Building, 
  Wallet, 
  QrCode, 
  MessageCircle, 
  ExternalLink, 
  Upload, 
  Image as ImageIcon,
  X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { OrderFormData, Order, PaymentMethod, PaymentSettings, ReferralSettings } from '@/lib/types';
import { formatCurrency, generateNewOrderMessage } from '@/lib/whatsapp';
import { 
  saveOrder, 
  generateOrderId, 
  addReferralUsage, 
  getReferralByCode,
  getPaymentSettings,
  getReferralSettings,
  getAdminWhatsApp
} from '@/lib/storage';
import { normalizeWhatsApp } from '@/lib/validation';
import { sendPaymentConfirmation } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';

interface PaymentStepProps {
  formData: OrderFormData;
  onBack: () => void;
}

type NotificationMethod = 'admin' | 'whatsapp';

const DEFAULT_PAYMENT: PaymentSettings = {
  bank_accounts: [],
  ewallets: [],
  qris: { enabled: false },
};

const DEFAULT_REFERRAL_SETTINGS: ReferralSettings = {
  commission_percentage: 10,
  min_payout: 100000,
  enabled: true,
};

export function PaymentStep({ formData, onBack }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [notificationMethod, setNotificationMethod] = useState<NotificationMethod>('admin');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT);
  const [referralSettings, setReferralSettings] = useState<ReferralSettings>(DEFAULT_REFERRAL_SETTINGS);

  useEffect(() => {
    const loadSettings = async () => {
      const [payment, referral] = await Promise.all([
        getPaymentSettings(),
        getReferralSettings(),
      ]);
      setPaymentSettings(payment);
      setReferralSettings(referral);
    };
    loadSettings();
  }, []);

  const bankAccounts = paymentSettings.bank_accounts.filter(b => b.active);
  const ewallets = paymentSettings.ewallets.filter(e => e.active);
  const qrisEnabled = paymentSettings.qris.enabled;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast({
        title: 'Disalin!',
        description: `${label} berhasil disalin ke clipboard.`,
      });
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      toast({
        title: 'Gagal menyalin',
        description: 'Silakan salin secara manual.',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File terlalu besar',
          description: 'Ukuran maksimal 5MB.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPaymentProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProof = () => {
    setPaymentProof(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentProof) {
      toast({
        title: 'Bukti pembayaran wajib',
        description: 'Silakan upload bukti pembayaran terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Generate order
      const orderId = generateOrderId();
      const now = new Date().toISOString();

      const order: Order = {
        order_id: orderId,
        imei: formData.imei,
        brand: formData.brand,
        model: formData.model,
        layanan_id: formData.layanan!.service_id,
        layanan_nama: formData.layanan!.nama,
        harga: formData.layanan!.harga,
        whatsapp: normalizeWhatsApp(formData.whatsapp),
        status: 'pesanan_dibuat',
        timeline: [
          {
            status: 'pesanan_dibuat',
            timestamp: now,
          },
        ],
        referral_code: formData.referral_code,
        payment_proof: paymentProof || undefined,
        payment_method: paymentMethod,
        notification_sent: notificationMethod === 'admin',
        garansi_bulan: formData.layanan?.garansi_bulan,
        created_at: now,
      };

      // Save to Supabase
      await saveOrder(order);

      // Update referral if used
      if (formData.referral_code) {
        const referral = await getReferralByCode(formData.referral_code);
        if (referral) {
          const komisi = order.harga * (referralSettings.commission_percentage / 100);
          await addReferralUsage(formData.referral_code, orderId, komisi);
        }
      }

      setCreatedOrder(order);
      setIsProcessing(false);
      setShowSuccessDialog(true);

      // If WhatsApp notification chosen, open WhatsApp
      if (notificationMethod === 'whatsapp') {
        const adminWa = await getAdminWhatsApp();
        const message = generateNewOrderMessage(order);
        window.open(`https://wa.me/${adminWa}?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setIsProcessing(false);
      toast({
        title: 'Gagal',
        description: 'Gagal membuat pesanan. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const handleSendWhatsApp = () => {
    if (createdOrder) {
      sendPaymentConfirmation(createdOrder);
    }
  };

  const handleCopyOrderId = () => {
    if (createdOrder) {
      copyToClipboard(createdOrder.order_id, 'Nomor Pesanan');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Pembayaran</h2>
        <p className="mt-2 text-muted-foreground">
          Pilih metode pembayaran dan upload bukti transfer
        </p>
      </div>

      {/* Amount Card */}
      <Card className="mx-auto max-w-lg mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Total Pembayaran</p>
          <p className="text-3xl font-bold text-primary mt-2">
            {formatCurrency(formData.layanan?.harga || 0)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Layanan: {formData.layanan?.nama}
          </p>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="mx-auto max-w-lg mb-6">
        <CardContent className="p-6">
          <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Transfer Bank</span>
                <span className="sm:hidden">Bank</span>
              </TabsTrigger>
              <TabsTrigger value="ewallet" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">E-Wallet</span>
                <span className="sm:hidden">E-Wallet</span>
              </TabsTrigger>
              <TabsTrigger value="qris" className="flex items-center gap-2" disabled={!qrisEnabled}>
                <QrCode className="h-4 w-4" />
                QRIS
              </TabsTrigger>
            </TabsList>

            {/* Bank Transfer */}
            <TabsContent value="bank" className="mt-6 space-y-4">
              {bankAccounts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Tidak ada rekening bank tersedia
                </p>
              ) : (
                bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{account.bank}</p>
                      <p className="text-sm font-mono text-muted-foreground">{account.nomor}</p>
                      <p className="text-xs text-muted-foreground">a.n. {account.atas_nama}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account.nomor, `Nomor ${account.bank}`)}
                    >
                      {copiedItem === `Nomor ${account.bank}` ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            {/* E-Wallet */}
            <TabsContent value="ewallet" className="mt-6 space-y-4">
              {ewallets.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Tidak ada e-wallet tersedia
                </p>
              ) : (
                ewallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{wallet.nama}</p>
                      <p className="text-sm font-mono text-muted-foreground">{wallet.nomor}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(wallet.nomor, `Nomor ${wallet.nama}`)}
                    >
                      {copiedItem === `Nomor ${wallet.nama}` ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            {/* QRIS */}
            <TabsContent value="qris" className="mt-6">
              <div className="text-center p-6 rounded-lg border bg-muted/30">
                {paymentSettings.qris.image ? (
                  <img 
                    src={paymentSettings.qris.image} 
                    alt="QRIS" 
                    className="w-48 h-48 mx-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto bg-card rounded-lg flex items-center justify-center border-2 border-dashed">
                    <QrCode className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  Scan QR code di atas menggunakan aplikasi mobile banking atau e-wallet Anda
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Proof Upload */}
      <Card className="mx-auto max-w-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5" />
            Upload Bukti Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {paymentProof ? (
            <div className="relative">
              <img 
                src={paymentProof} 
                alt="Bukti Pembayaran" 
                className="w-full max-h-64 object-contain rounded-lg border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveProof}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-colors"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Klik untuk upload bukti pembayaran
              </span>
              <span className="text-xs text-muted-foreground">
                Format: JPG, PNG (Maks. 5MB)
              </span>
            </button>
          )}
        </CardContent>
      </Card>

      {/* Notification Method */}
      <Card className="mx-auto max-w-lg mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Metode Notifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={notificationMethod} onValueChange={(v) => setNotificationMethod(v as NotificationMethod)}>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
              <RadioGroupItem value="admin" id="admin" />
              <Label htmlFor="admin" className="flex-1 cursor-pointer">
                <div className="font-medium">Notifikasi ke Admin Dashboard</div>
                <div className="text-sm text-muted-foreground">
                  Pesanan langsung muncul di halaman admin
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 mt-2">
              <RadioGroupItem value="whatsapp" id="whatsapp" />
              <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                <div className="font-medium">Kirim via WhatsApp</div>
                <div className="text-sm text-muted-foreground">
                  Buka WhatsApp untuk mengirim pesanan ke admin
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="mx-auto max-w-lg">
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button
            onClick={handleConfirmPayment}
            className="flex-1"
            disabled={isProcessing || !paymentProof}
          >
            {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
          </Button>
        </div>
        {!paymentProof && (
          <p className="text-sm text-destructive mt-2 text-center">
            * Upload bukti pembayaran untuk melanjutkan
          </p>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="text-center">Pesanan Berhasil Dibuat!</DialogTitle>
            <DialogDescription className="text-center">
              Nomor pesanan Anda:
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-lg font-mono font-bold text-foreground">
              {createdOrder?.order_id}
            </span>
            <Button variant="ghost" size="icon" onClick={handleCopyOrderId}>
              {copiedItem === 'Nomor Pesanan' ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {notificationMethod === 'admin' 
                ? 'Pesanan Anda sudah masuk ke sistem. Admin akan segera memproses.'
                : 'Silakan kirim bukti pembayaran via WhatsApp untuk mempercepat proses verifikasi.'
              }
            </p>

            <div className="flex flex-col gap-3">
              <Button onClick={handleSendWhatsApp} className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Kirim ke WhatsApp
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to={`/lacak?order=${createdOrder?.order_id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Lacak Pesanan
                </Link>
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button variant="ghost" onClick={() => setShowSuccessDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
