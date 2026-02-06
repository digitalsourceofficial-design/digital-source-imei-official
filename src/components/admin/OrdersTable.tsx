import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Eye, MessageCircle, Smartphone, Hash, Package, Copy, Check, Image as ImageIcon, Clock, Trash2, XCircle } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import { formatCurrency, formatTimestamp, sendStatusUpdate } from '@/lib/whatsapp';
import { updateOrderStatus, deleteOrder } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { OrderDetailTimeline } from './OrderDetailTimeline';

interface OrdersTableProps {
  orders: Order[];
  onOrderUpdate: () => void;
}

const statusOptions: OrderStatus[] = [
  'pesanan_dibuat',
  'pembayaran_diterima',
  'dalam_proses',
  'berhasil_unblock',
  'selesai',
   'gagal',
];

const statusColors: Record<OrderStatus, string> = {
  pesanan_dibuat: 'bg-muted text-muted-foreground',
  pembayaran_diterima: 'bg-accent/10 text-accent',
  dalam_proses: 'bg-warning/10 text-warning',
  berhasil_unblock: 'bg-success/10 text-success',
  selesai: 'bg-primary/10 text-primary',
   gagal: 'bg-destructive/10 text-destructive',
};

export function OrdersTable({ orders, onOrderUpdate }: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
   const [failureDialogOrder, setFailureDialogOrder] = useState<{orderId: string, fromDetail?: boolean} | null>(null);
   const [failureReason, setFailureReason] = useState('');
  const { toast } = useToast();

  const filteredOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter((order) => {
      const matchesSearch =
        order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.imei.includes(searchQuery) ||
        order.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  const handleCopyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(orderId);
      toast({
        title: 'Disalin!',
        description: 'Order ID berhasil disalin.',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: 'Gagal menyalin',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, failureReasonText?: string) => {
    // If status is 'gagal' and no failure reason provided, open dialog
    if (newStatus === 'gagal' && !failureReasonText) {
      setFailureReason('');
      setFailureDialogOrder({ orderId, fromDetail: selectedOrder?.order_id === orderId });
      return;
    }
    
    const updatedOrder = await updateOrderStatus(orderId, newStatus, failureReasonText);
    if (updatedOrder) {
      toast({
        title: 'Status Diperbarui',
        description: `Pesanan ${orderId} diubah ke "${ORDER_STATUS_LABELS[newStatus]}"`,
      });
      onOrderUpdate();
      
      // Update selected order if it's the one being modified
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    }
  };
   
   const handleFailureConfirm = async () => {
     if (!failureDialogOrder || !failureReason.trim()) {
       toast({
         title: 'Alasan diperlukan',
         description: 'Harap masukkan alasan kegagalan.',
         variant: 'destructive',
       });
       return;
     }
     
     await handleStatusChange(failureDialogOrder.orderId, 'gagal', failureReason.trim());
     setFailureDialogOrder(null);
     setFailureReason('');
   };

  const handleSendWhatsApp = (order: Order) => {
    sendStatusUpdate(order);
    toast({
      title: 'WhatsApp Dibuka',
      description: 'Template pesan sudah disiapkan di WhatsApp.',
    });
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    await deleteOrder(orderId);
    toast({
      title: 'Pesanan Dihapus',
      description: `Pesanan ${orderId} berhasil dihapus.`,
    });
    setDeleteOrderId(null);
    onOrderUpdate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pesanan</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari order ID, IMEI, atau merek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Bukti</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead className="hidden md:table-cell">IMEI</TableHead>
                <TableHead className="hidden sm:table-cell">Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Tidak ada pesanan ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell>
                      {order.payment_proof ? (
                        <button
                          onClick={() => setProofImage(order.payment_proof!)}
                          className="w-10 h-10 rounded overflow-hidden border hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={order.payment_proof}
                            alt="Bukti"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded border flex items-center justify-center bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">{order.order_id}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyOrderId(order.order_id)}
                        >
                          {copiedId === order.order_id ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">
                      {order.imei}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {order.brand} {order.model}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]} variant="secondary">
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatTimestamp(order.created_at).split('•')[0].trim()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetail(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSendWhatsApp(order)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteOrderId(order.order_id)}
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

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pesanan</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span className="font-mono">{selectedOrder?.order_id}</span>
                {selectedOrder && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopyOrderId(selectedOrder.order_id)}
                  >
                    {copiedId === selectedOrder.order_id ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                {/* Payment Proof */}
                {selectedOrder.payment_proof && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Bukti Pembayaran</p>
                    <button
                      onClick={() => setProofImage(selectedOrder.payment_proof!)}
                      className="w-full max-h-48 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={selectedOrder.payment_proof}
                        alt="Bukti Pembayaran"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">IMEI</p>
                      <p className="font-mono font-medium">{selectedOrder.imei}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Device</p>
                      <p className="font-medium">
                        {selectedOrder.brand} {selectedOrder.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Layanan</p>
                      <p className="font-medium">{selectedOrder.layanan_nama}</p>
                      {selectedOrder.garansi_bulan && (
                        <p className="text-xs text-muted-foreground">
                          Garansi {selectedOrder.garansi_bulan} bulan
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p className="font-medium">{selectedOrder.whatsapp}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(selectedOrder.harga)}
                  </span>
                </div>

                <Separator />

                {/* Status Change */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Ubah Status
                  </label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) =>
                      handleStatusChange(selectedOrder.order_id, value as OrderStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Full Timeline */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Riwayat Status</label>
                  <OrderDetailTimeline order={selectedOrder} />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => selectedOrder && handleSendWhatsApp(selectedOrder)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Kirim WhatsApp
              </Button>
              <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Proof Full Image Dialog */}
        <Dialog open={!!proofImage} onOpenChange={() => setProofImage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bukti Pembayaran</DialogTitle>
            </DialogHeader>
            {proofImage && (
              <img
                src={proofImage}
                alt="Bukti Pembayaran"
                className="w-full rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Pesanan?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus pesanan <span className="font-mono font-medium">{deleteOrderId}</span>? 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteOrderId && handleDeleteOrder(deleteOrderId)}
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
         
         {/* Failure Reason Dialog */}
         <Dialog open={!!failureDialogOrder} onOpenChange={() => setFailureDialogOrder(null)}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                 <XCircle className="h-5 w-5 text-destructive" />
                 Alasan Kegagalan
               </DialogTitle>
               <DialogDescription>
                 Masukkan alasan mengapa pesanan ini gagal diproses.
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="failure-reason">Alasan Kegagalan</Label>
                 <Textarea
                   id="failure-reason"
                   placeholder="Contoh: IMEI sudah pernah di-blacklist sebelumnya dan tidak dapat dibuka kembali..."
                   value={failureReason}
                   onChange={(e) => setFailureReason(e.target.value)}
                   rows={4}
                 />
               </div>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setFailureDialogOrder(null)}>
                 Batal
               </Button>
               <Button 
                 variant="destructive" 
                 onClick={handleFailureConfirm}
                 disabled={!failureReason.trim()}
               >
                 Konfirmasi Gagal
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
      </CardContent>
    </Card>
  );
}
