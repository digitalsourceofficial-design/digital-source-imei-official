import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { ReferralSettings } from '@/lib/types';
import { getReferralSettings, saveReferralSettings } from '@/lib/storage';
import { Users, Percent, Wallet, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/whatsapp';

const DEFAULT_REFERRAL: ReferralSettings = {
  commission_percentage: 10,
  min_payout: 100000,
  enabled: true,
};

export function ReferralSettingsForm() {
  const [settings, setSettings] = useState<ReferralSettings>(DEFAULT_REFERRAL);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getReferralSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (settings.commission_percentage < 0 || settings.commission_percentage > 100) {
      toast({
        title: 'Error',
        description: 'Persentase komisi harus antara 0-100%.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveReferralSettings(settings);
      setIsSaving(false);
      toast({
        title: 'Berhasil',
        description: 'Pengaturan referral berhasil disimpan.',
      });
    } catch {
      setIsSaving(false);
      toast({
        title: 'Gagal',
        description: 'Gagal menyimpan pengaturan.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pengaturan Referral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <Label className="text-base">Aktifkan Program Referral</Label>
            <p className="text-sm text-muted-foreground">
              Izinkan user mendapatkan komisi dari referral
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Commission Percentage */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Persentase Komisi
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.commission_percentage}
                onChange={(e) => setSettings({ ...settings, commission_percentage: Number(e.target.value) })}
                placeholder="10"
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Komisi per transaksi yang didapatkan referrer
            </p>
          </div>

          {/* Minimum Payout */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Minimum Payout
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rp</span>
              <Input
                type="number"
                min="0"
                value={settings.min_payout}
                onChange={(e) => setSettings({ ...settings, min_payout: Number(e.target.value) })}
                placeholder="100000"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum saldo untuk pencairan ({formatCurrency(settings.min_payout)})
            </p>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Contoh Perhitungan:</p>
          <p className="text-sm text-muted-foreground">
            Layanan Rp 300.000 × {settings.commission_percentage}% = {formatCurrency(300000 * settings.commission_percentage / 100)} komisi
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </CardContent>
    </Card>
  );
}
