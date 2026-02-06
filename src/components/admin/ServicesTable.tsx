import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Service } from '@/lib/types';
import { formatCurrency } from '@/lib/whatsapp';
import { saveService, deleteService } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface ServicesTableProps {
  services: Service[];
  onServiceUpdate: () => void;
}

const emptyService: Service = {
  service_id: '',
  nama: '',
  harga: 0,
  estimasi: '',
  garansi: '',
  garansi_bulan: 1,
  success_rate: 0,
  active: true,
};

export function ServicesTable({ services, onServiceUpdate }: ServicesTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Service>(emptyService);
  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingService(null);
    setFormData({
      ...emptyService,
      service_id: `service_${Date.now()}`,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nama || !formData.estimasi || formData.harga <= 0) {
      toast({
        title: 'Data Tidak Lengkap',
        description: 'Mohon isi semua field yang diperlukan.',
        variant: 'destructive',
      });
      return;
    }

    await saveService(formData);
    toast({
      title: editingService ? 'Layanan Diperbarui' : 'Layanan Ditambahkan',
      description: `Layanan "${formData.nama}" berhasil disimpan.`,
    });
    setIsDialogOpen(false);
    onServiceUpdate();
  };

  const handleDelete = async (service: Service) => {
    if (confirm(`Hapus layanan "${service.nama}"?`)) {
      await deleteService(service.service_id);
      toast({
        title: 'Layanan Dihapus',
        description: `Layanan "${service.nama}" telah dihapus.`,
      });
      onServiceUpdate();
    }
  };

  const handleToggleActive = async (service: Service) => {
    await saveService({ ...service, active: !service.active });
    toast({
      title: service.active ? 'Layanan Dinonaktifkan' : 'Layanan Diaktifkan',
      description: `Layanan "${service.nama}" telah ${service.active ? 'dinonaktifkan' : 'diaktifkan'}.`,
    });
    onServiceUpdate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manajemen Layanan</CardTitle>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Layanan
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead className="hidden sm:table-cell">Estimasi</TableHead>
                <TableHead className="hidden md:table-cell">Tingkat Sukses</TableHead>
                <TableHead>Aktif</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Belum ada layanan
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.service_id}>
                    <TableCell className="font-medium">{service.nama}</TableCell>
                    <TableCell>{formatCurrency(service.harga)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{service.estimasi}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {service.success_rate}%
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={service.active}
                        onCheckedChange={() => handleToggleActive(service)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </DialogTitle>
              <DialogDescription>
                Isi detail layanan unblock IMEI
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Layanan</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Express"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harga">Harga (Rp)</Label>
                <Input
                  id="harga"
                  type="number"
                  value={formData.harga}
                  onChange={(e) =>
                    setFormData({ ...formData, harga: parseInt(e.target.value) || 0 })
                  }
                  placeholder="500000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimasi">Estimasi Waktu</Label>
                <Input
                  id="estimasi"
                  value={formData.estimasi}
                  onChange={(e) => setFormData({ ...formData, estimasi: e.target.value })}
                  placeholder="Contoh: 1-3 hari kerja"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="garansi">Deskripsi Garansi</Label>
                <Input
                  id="garansi"
                  value={formData.garansi}
                  onChange={(e) => setFormData({ ...formData, garansi: e.target.value })}
                  placeholder="Contoh: Garansi 3 bulan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="garansi_bulan">Durasi Garansi (Bulan)</Label>
                <Input
                  id="garansi_bulan"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.garansi_bulan || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      garansi_bulan: Math.min(24, Math.max(1, parseInt(e.target.value) || 1)),
                    })
                  }
                  placeholder="3"
                />
                <p className="text-xs text-muted-foreground">
                  Digunakan untuk menghitung tanggal kadaluarsa layanan
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="success_rate">Tingkat Keberhasilan (%)</Label>
                <Input
                  id="success_rate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.success_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      success_rate: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                    })
                  }
                  placeholder="95"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Aktif</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
