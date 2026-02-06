import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { CompanySettings } from '@/lib/types';
import { useCompanySettings, useUpdateCompanySettings } from '@/hooks/use-company-settings';
import { Building2, Phone, FileText, Clock, MapPin, Save } from 'lucide-react';

export function CompanySettingsForm() {
  const { data: loadedSettings, isLoading } = useCompanySettings();
  const { updateSettings } = useUpdateCompanySettings();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  }, [loadedSettings]);

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Pengaturan Perusahaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toast({
        title: 'Berhasil',
        description: 'Pengaturan perusahaan berhasil disimpan.',
      });
    } catch {
      toast({
        title: 'Gagal',
        description: 'Gagal menyimpan pengaturan.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Pengaturan Perusahaan
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nama Perusahaan</Label>
            <Input
              value={settings.name}
              onChange={(e) =>
                setSettings({ ...settings, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input
              value={settings.whatsapp}
              onChange={(e) =>
                setSettings({ ...settings, whatsapp: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Copyright</Label>
            <Input
              value={settings.copyright}
              onChange={(e) =>
                setSettings({ ...settings, copyright: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Jadwal Operasional</Label>
            <Input
              value={settings.schedule}
              onChange={(e) =>
                setSettings({ ...settings, schedule: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Alamat</Label>
          <Textarea
            value={settings.address || ''}
            onChange={(e) =>
              setSettings({ ...settings, address: e.target.value })
            }
            rows={2}
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </CardContent>
    </Card>
  );
}
