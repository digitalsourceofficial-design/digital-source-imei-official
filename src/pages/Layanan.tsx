import { useState } from 'react';
import { StepIndicator } from '@/components/layanan/StepIndicator';
import { ServiceSelection } from '@/components/layanan/ServiceSelection';
import { DataInput } from '@/components/layanan/DataInput';
import { OrderConfirmation } from '@/components/layanan/OrderConfirmation';
import { PaymentStep } from '@/components/layanan/PaymentStep';
import { useActiveServices } from '@/hooks/use-services';
import type { Service, OrderFormData } from '@/lib/types';

const STEP_LABELS = ['Pilih Layanan', 'Input Data', 'Konfirmasi', 'Pembayaran'];

export default function Layanan() {
  const [currentStep, setCurrentStep] = useState(1);
  const { data: services = [], isLoading } = useActiveServices();

  const [formData, setFormData] = useState<OrderFormData>({
    imei: '',
    brand: '',
    model: '',
    whatsapp: '',
    agreed: false,
  });

  const updateFormData = (data: Partial<OrderFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectService = (service: Service) => {
    updateFormData({ layanan: service });
  };

  return (
    <div className="container py-8 md:py-12">
      {/* Step Indicator */}
      <div className="mx-auto max-w-3xl mb-8">
        <StepIndicator
          currentStep={currentStep}
          totalSteps={4}
          stepLabels={STEP_LABELS}
        />
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-4xl">
        {currentStep === 1 && (
          <ServiceSelection
            services={services}
            selectedService={formData.layanan}
            onSelect={selectService}
            onNext={nextStep}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && (
          <DataInput
            formData={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 3 && (
          <OrderConfirmation
            formData={formData}
            onNext={() => {
              updateFormData({ agreed: true });
              nextStep();
            }}
            onBack={prevStep}
          />
        )}

        {currentStep === 4 && (
          <PaymentStep formData={formData} onBack={prevStep} />
        )}
      </div>
    </div>
  );
}
