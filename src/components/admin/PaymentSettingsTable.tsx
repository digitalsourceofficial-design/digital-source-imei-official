import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Building, Wallet, QrCode, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BankAccount, EWallet, PaymentSettings } from '@/lib/types';
import { getPaymentSettings, savePaymentSettings } from '@/lib/storage';

const DEFAULT_PAYMENT: PaymentSettings = {
  bank_accounts: [],
  ewallets: [],
  qris: { enabled: false },
};

export function PaymentSettingsTable() {
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT);
  const [activeTab, setActiveTab] = useState('bank');
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showEwalletDialog, setShowEwalletDialog] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [editingEwallet, setEditingEwallet] = useState<EWallet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getPaymentSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  // Bank form state
  const [bankForm, setBankForm] = useState({
    bank: '',
    nomor: '',
    atas_nama: '',
  });

  // E-Wallet form state
  const [ewalletForm, setEwalletForm] = useState({
    nama: '',
    nomor: '',
  });

  const handleSaveSettings = async (newSettings: PaymentSettings) => {
    await savePaymentSettings(newSettings);
    setSettings(newSettings);
    toast({
      title: 'Berhasil',
      description: 'Pengaturan pembayaran berhasil disimpan.',
    });
  };

  // Bank handlers
  const handleAddBank = () => {
    setEditingBank(null);
    setBankForm({ bank: '', nomor: '', atas_nama: '' });
    setShowBankDialog(true);
  };

  const handleEditBank = (bank: BankAccount) => {
    setEditingBank(bank);
    setBankForm({
      bank: bank.bank,
      nomor: bank.nomor,
      atas_nama: bank.atas_nama,
    });
    setShowBankDialog(true);
  };

  const handleSaveBank = () => {
    if (!bankForm.bank || !bankForm.nomor || !bankForm.atas_nama) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi.',
        variant: 'destructive',
      });
      return;
    }

    const newSettings = { ...settings };
    if (editingBank) {
      const index = newSettings.bank_accounts.findIndex(b => b.id === editingBank.id);
      if (index >= 0) {
        newSettings.bank_accounts[index] = {
          ...editingBank,
          ...bankForm,
        };
      }
    } else {
      newSettings.bank_accounts.push({
        id: Date.now().toString(),
        ...bankForm,
        active: true,
      });
    }

    handleSaveSettings(newSettings);
    setShowBankDialog(false);
  };

  const handleDeleteBank = (id: string) => {
    const newSettings = {
      ...settings,
      bank_accounts: settings.bank_accounts.filter(b => b.id !== id),
    };
    handleSaveSettings(newSettings);
  };

  const handleToggleBank = (id: string, active: boolean) => {
    const newSettings = {
      ...settings,
      bank_accounts: settings.bank_accounts.map(b =>
        b.id === id ? { ...b, active } : b
      ),
    };
    handleSaveSettings(newSettings);
  };

  // E-Wallet handlers
  const handleAddEwallet = () => {
    setEditingEwallet(null);
    setEwalletForm({ nama: '', nomor: '' });
    setShowEwalletDialog(true);
  };

  const handleEditEwallet = (ewallet: EWallet) => {
    setEditingEwallet(ewallet);
    setEwalletForm({
      nama: ewallet.nama,
      nomor: ewallet.nomor,
    });
    setShowEwalletDialog(true);
  };

  const handleSaveEwallet = () => {
    if (!ewalletForm.nama || !ewalletForm.nomor) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi.',
        variant: 'destructive',
      });
      return;
    }

    const newSettings = { ...settings };
    if (editingEwallet) {
      const index = newSettings.ewallets.findIndex(e => e.id === editingEwallet.id);
      if (index >= 0) {
        newSettings.ewallets[index] = {
          ...editingEwallet,
          ...ewalletForm,
        };
      }
    } else {
      newSettings.ewallets.push({
        id: Date.now().toString(),
        ...ewalletForm,
        active: true,
      });
    }

    handleSaveSettings(newSettings);
    setShowEwalletDialog(false);
  };

  const handleDeleteEwallet = (id: string) => {
    const newSettings = {
      ...settings,
      ewallets: settings.ewallets.filter(e => e.id !== id),
    };
    handleSaveSettings(newSettings);
  };

  const handleToggleEwallet = (id: string, active: boolean) => {
    const newSettings = {
      ...settings,
      ewallets: settings.ewallets.map(e =>
        e.id === id ? { ...e, active } : e
      ),
    };
    handleSaveSettings(newSettings);
  };

  // QRIS handlers
  const handleToggleQris = (enabled: boolean) => {
    const newSettings = {
      ...settings,
      qris: { ...settings.qris, enabled },
    };
    handleSaveSettings(newSettings);
  };

  const handleQrisImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newSettings = {
          ...settings,
          qris: { ...settings.qris, image: reader.result as string },
        };
        handleSaveSettings(newSettings);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQrisImage = () => {
    const newSettings = {
      ...settings,
      qris: { ...settings.qris, image: undefined },
    };
    handleSaveSettings(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Bank
            </TabsTrigger>
            <TabsTrigger value="ewallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              E-Wallet
            </TabsTrigger>
            <TabsTrigger value="qris" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QRIS
            </TabsTrigger>
          </TabsList>

          {/* Bank Accounts */}
          <TabsContent value="bank" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddBank}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Bank
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>Nomor Rekening</TableHead>
                  <TableHead>Atas Nama</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.bank_accounts.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">{bank.bank}</TableCell>
                    <TableCell className="font-mono">{bank.nomor}</TableCell>
                    <TableCell>{bank.atas_nama}</TableCell>
                    <TableCell>
                      <Switch
                        checked={bank.active}
                        onCheckedChange={(checked) => handleToggleBank(bank.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditBank(bank)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBank(bank.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* E-Wallets */}
          <TabsContent value="ewallet" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddEwallet}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah E-Wallet
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.ewallets.map((ewallet) => (
                  <TableRow key={ewallet.id}>
                    <TableCell className="font-medium">{ewallet.nama}</TableCell>
                    <TableCell className="font-mono">{ewallet.nomor}</TableCell>
                    <TableCell>
                      <Switch
                        checked={ewallet.active}
                        onCheckedChange={(checked) => handleToggleEwallet(ewallet.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditEwallet(ewallet)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEwallet(ewallet.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* QRIS */}
          <TabsContent value="qris" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Aktifkan QRIS</Label>
                  <p className="text-sm text-muted-foreground">
                    Tampilkan opsi QRIS di halaman pembayaran
                  </p>
                </div>
                <Switch
                  checked={settings.qris.enabled}
                  onCheckedChange={handleToggleQris}
                />
              </div>

              <div>
                <Label>Gambar QRIS</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQrisImageChange}
                  className="hidden"
                />

                {settings.qris.image ? (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={settings.qris.image}
                      alt="QRIS"
                      className="w-48 h-48 object-contain rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveQrisImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-48 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload QRIS</span>
                  </button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Bank Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBank ? 'Edit Bank' : 'Tambah Bank'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Bank</Label>
              <Input
                value={bankForm.bank}
                onChange={(e) => setBankForm({ ...bankForm, bank: e.target.value })}
                placeholder="BCA, Mandiri, BRI, dll"
              />
            </div>
            <div>
              <Label>Nomor Rekening</Label>
              <Input
                value={bankForm.nomor}
                onChange={(e) => setBankForm({ ...bankForm, nomor: e.target.value })}
                placeholder="1234567890"
              />
            </div>
            <div>
              <Label>Atas Nama</Label>
              <Input
                value={bankForm.atas_nama}
                onChange={(e) => setBankForm({ ...bankForm, atas_nama: e.target.value })}
                placeholder="PT IMEI Unblock Indonesia"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBankDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveBank}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* E-Wallet Dialog */}
      <Dialog open={showEwalletDialog} onOpenChange={setShowEwalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEwallet ? 'Edit E-Wallet' : 'Tambah E-Wallet'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama E-Wallet</Label>
              <Input
                value={ewalletForm.nama}
                onChange={(e) => setEwalletForm({ ...ewalletForm, nama: e.target.value })}
                placeholder="GoPay, OVO, DANA, dll"
              />
            </div>
            <div>
              <Label>Nomor</Label>
              <Input
                value={ewalletForm.nomor}
                onChange={(e) => setEwalletForm({ ...ewalletForm, nomor: e.target.value })}
                placeholder="081234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEwalletDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEwallet}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
