import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, Shield, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Service } from '@/lib/types';
import { formatCurrency } from '@/lib/whatsapp';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceSelectionProps {
  services: Service[];
  selectedService?: Service;
  onSelect: (service: Service) => void;
  onNext: () => void;
   isLoading?: boolean;
}

export function ServiceSelection({ services, selectedService, onSelect, onNext, isLoading }: ServiceSelectionProps) {
   if (isLoading) {
     return (
       <div className="animate-fade-in">
         <div className="text-center mb-8">
           <h2 className="text-2xl font-bold text-foreground">Pilih Layanan Unblock</h2>
           <p className="mt-2 text-muted-foreground">
             Memuat layanan...
           </p>
         </div>
         <div className="grid gap-4 md:grid-cols-3">
           {[1, 2, 3].map((i) => (
             <Card key={i}>
               <CardContent className="p-6 space-y-4">
                 <Skeleton className="h-6 w-32 mx-auto" />
                 <Skeleton className="h-10 w-24 mx-auto" />
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-3/4" />
                 </div>
                 <Skeleton className="h-10 w-full" />
               </CardContent>
             </Card>
           ))}
         </div>
       </div>
     );
   }
 
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Pilih Layanan Unblock</h2>
        <p className="mt-2 text-muted-foreground">
          Pilih paket layanan sesuai kebutuhan Anda
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {services.map((service) => {
          const isSelected = selectedService?.service_id === service.service_id;
          const isPopular = service.service_id === 'priority';
          
          return (
            <Card
              key={service.service_id}
              className={cn(
                'relative cursor-pointer transition-all hover:shadow-lg',
                isSelected
                  ? 'ring-2 ring-accent border-accent'
                  : 'hover:border-accent/50',
                isPopular && 'md:scale-105'
              )}
              onClick={() => onSelect(service)}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent">
                  Paling Populer
                </Badge>
              )}
              
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground">{service.nama}</h3>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-primary">
                      {formatCurrency(service.harga)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">Estimasi: {service.estimasi}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">
                      Tingkat keberhasilan: {service.success_rate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">{service.garansi}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(service);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Terpilih
                      </>
                    ) : (
                      'Pilih Paket'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedService && (
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={onNext}>
            Lanjutkan
          </Button>
        </div>
      )}
    </div>
  );
}
