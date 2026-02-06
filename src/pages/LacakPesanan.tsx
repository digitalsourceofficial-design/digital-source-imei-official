import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderTimeline } from '@/components/tracking/OrderTimeline';
import {
  Search,
  Smartphone,
  Hash,
  Package,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { getOrderById, getOrderByImei } from '@/lib/storage';
import { sendStatusUpdate, formatCurrency } from '@/lib/whatsapp';
import type { Order } from '@/lib/types';

export default function LacakPesanan() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (orderId) {
      setSearchQuery(orderId);
      searchOrder(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const searchOrder = async (query?: string) => {
    const q = (query || searchQuery).trim();
    if (!q) return;

    setHasSearched(true);

    let foundOrder = await getOrderById(q);
    if (!foundOrder) {
      foundOrder = await getOrderByImei(q);
    }

    if (foundOrder) {
      setOrder(foundOrder);
      setNotFound(false);
    } else {
      setOrder(null);
      setNotFound(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder();
  };

  const handleSendWhatsApp = () => {
    if (order) sendStatusUpdate(order);
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Lacak Pesanan</h1>
          <p className="mt-2 text-muted-foreground">
            Masukkan nomor pesanan atau IMEI untuk melihat status
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nomor pesanan atau IMEI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Cari</Button>
            </form>
          </CardContent>
        </Card>

        {/* Not Found */}
        {notFound && hasSearched && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Pesanan Tidak Ditemukan</h3>
              <p className="text-sm text-muted-foreground">
                Pastikan nomor pesanan atau IMEI sudah benar.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detail Pesanan
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor Pesanan</p>
                    <p className="font-mono font-semibold">{order.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Layanan</p>
                    <p className="font-semibold">{order.layanan_nama}</p>
                  </div>
                  <div className="flex gap-2">
                    <Hash className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">IMEI</p>
                      <p className="font-mono font-semibold">{order.imei}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Smartphone className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Device</p>
                      <p className="font-semibold">
                        {order.brand} {order.model}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Pembayaran
                  </span>
                  <span className="font-bold text-primary">
                    {formatCurrency(order.harga)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline
                  timeline={order.timeline}
                  currentStatus={order.status}
                  failureReason={order.failure_reason}
                />
              </CardContent>
            </Card>

            <Button onClick={handleSendWhatsApp} size="lg" className="w-full">
              <MessageCircle className="mr-2 h-5 w-5" />
              Kirim Update ke WhatsApp
            </Button>
          </div>
        )}

        {!hasSearched && !order && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold mb-2">Cari Pesanan Anda</h3>
              <p className="text-sm text-muted-foreground">
                Masukkan nomor pesanan atau IMEI 15 digit
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
