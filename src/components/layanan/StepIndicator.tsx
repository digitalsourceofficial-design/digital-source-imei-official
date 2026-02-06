import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-muted rounded-full" />
        <div 
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-accent rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            
            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                    isCompleted
                      ? 'bg-accent border-accent text-accent-foreground'
                      : isCurrent
                      ? 'bg-primary border-primary text-primary-foreground scale-110'
                      : 'bg-card border-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step}
                </div>
                <span 
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px] hidden sm:block',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {stepLabels[step - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile step label */}
      <div className="sm:hidden text-center mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} dari {totalSteps}:
        </span>
        <span className="ml-2 text-sm font-semibold text-foreground">
          {stepLabels[currentStep - 1]}
        </span>
      </div>
    </div>
  );
}
