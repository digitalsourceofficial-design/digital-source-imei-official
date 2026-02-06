import { cn } from '@/lib/utils';
import { Check, Clock, Calendar, Shield, XCircle, AlertTriangle } from 'lucide-react';
import type { TimelineItem, OrderStatus, Order } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import { formatTimestamp } from '@/lib/whatsapp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderDetailTimelineProps {
  order: Order;
}

const ALL_STATUSES: OrderStatus[] = [
  'pesanan_dibuat',
  'pembayaran_diterima',
  'dalam_proses',
  'berhasil_unblock',
  'selesai',
];

export function OrderDetailTimeline({ order }: OrderDetailTimelineProps) {
  const currentIndex = ALL_STATUSES.indexOf(order.status);
   const isFailed = order.status === 'gagal';

  const getTimelineEntry = (status: OrderStatus): TimelineItem | undefined => {
    return order.timeline.find((t) => t.status === status);
  };
   
   const failedEntry = order.timeline.find(t => t.status === 'gagal');

  const formatFullTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    };
    return date.toLocaleDateString('id-ID', options) + ' WIB';
  };

  return (
    <div className="space-y-4">
       {/* Failure Reason Card */}
       {isFailed && order.failure_reason && (
         <Card className="border-destructive/30 bg-destructive/5">
           <CardHeader className="pb-2">
             <CardTitle className="flex items-center gap-2 text-sm text-destructive">
               <XCircle className="h-4 w-4" />
               Pesanan Gagal
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-2 text-sm">
             {failedEntry && (
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Waktu:</span>
                 <span className="font-medium">{formatFullTimestamp(failedEntry.timestamp)}</span>
               </div>
             )}
             <div className="pt-2 border-t">
               <span className="text-muted-foreground block mb-1">Alasan Kegagalan:</span>
               <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
                 <div className="flex items-start gap-2">
                   <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                   <p className="text-destructive">{order.failure_reason}</p>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       )}
       
      {/* Expiration Info */}
      {order.unblock_date && order.expiration_date && (
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-success">
              <Shield className="h-4 w-4" />
              Informasi Garansi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Unblock:</span>
              <span className="font-medium">{formatFullTimestamp(order.unblock_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Masa Aktif Hingga:</span>
              <Badge variant="outline" className="font-mono">
                {formatFullTimestamp(order.expiration_date)}
              </Badge>
            </div>
            {order.garansi_bulan && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durasi Garansi:</span>
                <span className="font-medium">{order.garansi_bulan} bulan</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative pl-2">
        {ALL_STATUSES.map((status, index) => {
          const entry = getTimelineEntry(status);
          const isCompleted = !isFailed && index <= currentIndex && entry;
          const isCurrent = status === order.status;
          const isPending = isFailed ? true : index > currentIndex;
          
          // Show completed statuses before failure
          const failedAtIndex = isFailed ? order.timeline.filter(t => ALL_STATUSES.includes(t.status as OrderStatus)).length - 1 : -1;
          const wasCompletedBeforeFail = isFailed && entry && index <= failedAtIndex;

          return (
            <div key={status} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Connector Line */}
              {index < ALL_STATUSES.length - 1 && (
                <div
                  className={cn(
                    'absolute left-[15px] top-9 h-full w-0.5',
                    isCompleted || wasCompletedBeforeFail ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                  isCompleted || wasCompletedBeforeFail
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCurrent && !isFailed
                    ? 'border-primary bg-primary/10 text-primary animate-pulse'
                    : 'border-muted bg-muted text-muted-foreground'
                )}
              >
                {isCompleted || wasCompletedBeforeFail ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent && !isFailed ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className={cn(
                    'font-semibold text-sm',
                    isCompleted || wasCompletedBeforeFail || (isCurrent && !isFailed) ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {ORDER_STATUS_LABELS[status]}
                </p>
                {entry && (isCompleted || wasCompletedBeforeFail) ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {formatFullTimestamp(entry.timestamp)}
                    </p>
                  </div>
                ) : isPending && !wasCompletedBeforeFail ? (
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">
                    {isFailed ? 'Tidak diproses' : 'Menunggu proses sebelumnya'}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
