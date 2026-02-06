import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { ServicesTable } from '@/components/admin/ServicesTable';
import { ReferralsTable } from '@/components/admin/ReferralsTable';
import { PaymentSettingsTable } from '@/components/admin/PaymentSettingsTable';
import { CompanySettingsForm } from '@/components/admin/CompanySettingsForm';
import { ReferralSettingsForm } from '@/components/admin/ReferralSettingsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  isAdminLoggedIn,
  clearAdminSession,
} from '@/lib/storage';
import type { Order } from '@/lib/types';
import { Package, ImageIcon, Loader2 } from 'lucide-react';
import { formatTimestamp } from '@/lib/whatsapp';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOrders } from '@/hooks/use-orders';
import { useServices } from '@/hooks/use-services';
import { useReferrals } from '@/hooks/use-referrals';
import { useQueryClient } from '@tanstack/react-query';

function AdminDashboard() {
  const { data: orders = [], isLoading, refetch } = useOrders();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // Recent orders - prioritize new orders with payment proof
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  // New orders count (pesanan_dibuat status)
  const newOrdersCount = orders.filter(o => o.status === 'pesanan_dibuat').length;

   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
     );
   }
 
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Admin Dashboard IMEI Unblock
        </p>
      </div>

      <DashboardStats orders={orders} />

      {/* Recent Orders with Payment Proof */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pesanan Terbaru
            {newOrdersCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {newOrdersCount} Baru
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Belum ada pesanan
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    {/* Payment Proof Thumbnail */}
                    {order.payment_proof && (
                      <button
                        onClick={() => setSelectedProof(order.payment_proof!)}
                        className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={order.payment_proof}
                          alt="Bukti"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    {!order.payment_proof && (
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-mono font-medium">{order.order_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.brand} {order.model}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={order.status === 'pesanan_dibuat' ? 'default' : 'secondary'}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(order.created_at).split('•')[0].trim()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Proof Dialog */}
      <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <img
              src={selectedProof}
              alt="Bukti Pembayaran"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminPesanan() {
  const { data: orders = [], refetch } = useOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manajemen Pesanan</h1>
        <p className="text-muted-foreground">
          Kelola dan update status pesanan
        </p>
      </div>

      <OrdersTable orders={orders} onOrderUpdate={refetch} />
    </div>
  );
}

function AdminLayanan() {
  const { data: services = [], refetch } = useServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manajemen Layanan</h1>
        <p className="text-muted-foreground">
          Tambah, edit, atau hapus layanan unblock IMEI
        </p>
      </div>

      <ServicesTable services={services} onServiceUpdate={refetch} />
    </div>
  );
}

function AdminReferral() {
  const { data: referrals = [], refetch } = useReferrals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manajemen Referral</h1>
        <p className="text-muted-foreground">
          Lihat data referral dan komisi
        </p>
      </div>

      <ReferralsTable referrals={referrals} onReferralUpdate={refetch} />
    </div>
  );
}

function AdminPembayaran() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Pembayaran</h1>
        <p className="text-muted-foreground">
          Kelola rekening bank, e-wallet, dan QRIS
        </p>
      </div>

      <PaymentSettingsTable />
    </div>
  );
}

function AdminPengaturan() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan website dan referral
        </p>
      </div>

      <CompanySettingsForm />
      <ReferralSettingsForm />
    </div>
  );
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAdminLoggedIn());
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="pesanan" element={<AdminPesanan />} />
        <Route path="layanan" element={<AdminLayanan />} />
        <Route path="referral" element={<AdminReferral />} />
        <Route path="pembayaran" element={<AdminPembayaran />} />
        <Route path="pengaturan" element={<AdminPengaturan />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
