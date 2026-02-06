import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle, Wallet } from 'lucide-react';
import type { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/whatsapp';

interface DashboardStatsProps {
  orders: Order[];
}

export function DashboardStats({ orders }: DashboardStatsProps) {
  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => o.status !== 'selesai'
  ).length;
  const completedOrders = orders.filter((o) => o.status === 'selesai').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.harga, 0);

  const stats = [
    {
      title: 'Total Pesanan',
      value: totalOrders,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pesanan Aktif',
      value: activeOrders,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Pesanan Selesai',
      value: completedOrders,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(totalRevenue),
      icon: Wallet,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      isRevenue: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${stat.isRevenue ? 'text-foreground' : ''}`}>
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
