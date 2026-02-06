import { cn } from '@/lib/utils';
import { Check, Clock, XCircle, AlertTriangle } from 'lucide-react';
import type { TimelineItem, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import { formatTimestamp } from '@/lib/whatsapp';

interface OrderTimelineProps {
  timeline: TimelineItem[];
  currentStatus: OrderStatus;
   failureReason?: string;
}

const ALL_STATUSES: OrderStatus[] = [
  'pesanan_dibuat',
  'pembayaran_diterima',
  'dalam_proses',
  'berhasil_unblock',
  'selesai',
];

export function OrderTimeline({ timeline, currentStatus, failureReason }: OrderTimelineProps) {
  const currentIndex = ALL_STATUSES.indexOf(currentStatus);
   const isFailed = currentStatus === 'gagal';

  const getTimelineEntry = (status: OrderStatus): TimelineItem | undefined => {
    return timeline.find((t) => t.status === status);
  };
   
   // Get the failed timeline entry
   const failedEntry = timeline.find(t => t.status === 'gagal');

  return (
    <div className="relative">
       {/* Show failure status at top if failed */}
       {isFailed && (
         <div className="relative flex gap-4 pb-8">
           {/* Connector Line */}
           <div className="absolute left-[17px] top-10 h-full w-0.5 bg-destructive" />
 
           {/* Icon */}
           <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground">
             <XCircle className="h-4 w-4" />
           </div>
 
           {/* Content */}
           <div className="flex-1 min-w-0">
             <p className="font-semibold text-destructive">
               {ORDER_STATUS_LABELS['gagal']}
             </p>
             {failedEntry && (
               <p className="text-sm text-muted-foreground mt-1">
                 {formatTimestamp(failedEntry.timestamp)}
               </p>
             )}
             {failureReason && (
               <div className="mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                 <div className="flex items-start gap-2">
                   <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                   <p className="text-sm text-destructive">
                     {failureReason}
                   </p>
                 </div>
               </div>
             )}
           </div>
         </div>
       )}
       
      {ALL_STATUSES.map((status, index) => {
        const entry = getTimelineEntry(status);
        const isCompleted = !isFailed && index <= currentIndex && entry;
        const isCurrent = status === currentStatus;
        const isPending = isFailed ? true : index > currentIndex;
        
        // If failed, show completed statuses up to the point of failure
        const failedAtIndex = isFailed ? timeline.filter(t => ALL_STATUSES.includes(t.status as OrderStatus)).length - 1 : -1;
        const wasCompletedBeforeFail = isFailed && entry && index <= failedAtIndex;

        return (
          <div key={status} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Connector Line */}
            {index < ALL_STATUSES.length - 1 && (
              <div
                className={cn(
                  'absolute left-[17px] top-10 h-full w-0.5',
                  isCompleted || wasCompletedBeforeFail ? 'bg-accent' : 'bg-muted'
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                isCompleted || wasCompletedBeforeFail
                  ? 'border-accent bg-accent text-accent-foreground'
                  : isCurrent && !isFailed
                  ? 'border-primary bg-primary text-primary-foreground animate-pulse-soft'
                  : 'border-muted bg-muted text-muted-foreground'
              )}
            >
              {isCompleted || wasCompletedBeforeFail ? (
                <Check className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-semibold',
                  isCompleted || wasCompletedBeforeFail || (isCurrent && !isFailed) ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {ORDER_STATUS_LABELS[status]}
              </p>
              {entry && (isCompleted || wasCompletedBeforeFail) ? (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatTimestamp(entry.timestamp)}
                </p>
              ) : isPending && !wasCompletedBeforeFail ? (
                <p className="text-sm text-muted-foreground/60 mt-1 italic">
                  {isFailed ? 'Tidak diproses' : 'Menunggu proses sebelumnya'}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
