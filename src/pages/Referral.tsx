import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Copy,
  Check,
  Share2,
  Gift,
  Users,
  Wallet,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getReferrals,
  saveReferral,
  generateReferralCode,
} from '@/lib/storage';
import { formatCurrency, formatTimestamp } from '@/lib/whatsapp';
import type { Referral } from '@/lib/types';

export default function ReferralPage() {
  const [referral, setReferral] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrCreateReferral();
  }, []);

  const loadOrCreateReferral = async () => {
    const referrals = await getReferrals();

    if (referrals.length > 0) {
      setReferral(referrals[0]);
    } else {
      const newReferral: Referral = {
        referral_code: generateReferralCode(),
        total_user: 0,
        total_komisi: 0,
        history: [],
      };
      await saveReferral(newReferral);
      setReferral(newReferral);
    }
  };

  const copyReferralCode = async () => {
    if (!referral) return;

    try {
      await navigator.clipboard.writeText(referral.referral_code);
      setCopied(true);
      toast({
        title: 'Kode Disalin!',
        description: 'Kode referral berhasil disalin ke clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Gagal menyalin',
        description: 'Silakan salin secara manual.',
        variant: 'destructive',
      });
    }
  };

  const shareToWhatsApp = () => {
    if (!referral) return;

    const message = `🎁 *Dapatkan layanan IMEI Unblock dengan diskon khusus!*

Gunakan kode referral saya: *${referral.referral_code}*

Kunjungi: ${window.location.origin}/layanan

Layanan unblock IMEI cepat, aman, dan terpercaya! 🚀`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const targetReferrals = 10;
  const progressPercent = referral
    ? Math.min((referral.total_user / targetReferrals) * 100, 100)
    : 0;

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
            <Gift className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Program Referral
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ajak teman dan dapatkan komisi untuk setiap transaksi
          </p>
        </div>

        {/* Referral Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kode Referral Anda</CardTitle>
            <CardDescription>
              Bagikan kode ini kepada teman untuk mendapatkan komisi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border-2 border-dashed">
              <span className="flex-1 text-2xl font-mono font-bold text-center">
                {referral?.referral_code || '---'}
              </span>
              <Button variant="outline" size="icon" onClick={copyReferralCode}>
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={copyReferralCode} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Salin Kode
              </Button>
              <Button onClick={shareToWhatsApp} className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <Users className="h-6 w-6 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Total Referral</p>
                <p className="text-2xl font-bold">
                  {referral?.total_user || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <Wallet className="h-6 w-6 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Komisi</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(referral?.total_komisi || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              Progress Menuju Target
            </CardTitle>
            <CardDescription>
              {referral?.total_user || 0} dari {targetReferrals} referral
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-3" />
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Referral</CardTitle>
          </CardHeader>
          <CardContent>
            {referral?.history?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Komisi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referral.history.map((item) => (
                    <TableRow key={item.order_id}>
                      <TableCell className="font-mono text-sm">
                        {item.order_id}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(item.tanggal)
                          .split('•')[0]
                          .trim()}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.komisi)}
                      </TableCell>
                      <TableCell>
                        {item.status === 'paid' ? 'Dibayar' : 'Pending'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Belum ada riwayat referral
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
