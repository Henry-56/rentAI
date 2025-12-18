import React from 'react';
import { CheckCircle2, Circle, Clock, CreditCard, XCircle, Package, Flag } from 'lucide-react';
import { RentalStatus } from '../types';

interface RentalTimelineProps {
  status: RentalStatus;
}

export const RentalTimeline: React.FC<RentalTimelineProps> = ({ status }) => {
  const steps = [
    { id: 'DRAFT', label: 'Borrador', icon: Circle },
    { id: 'PENDING_PAYMENT', label: 'Por Pagar', icon: CreditCard },
    { id: 'IN_REVIEW', label: 'En Revisión', icon: Clock },
    { id: 'CONFIRMED', label: 'Confirmada', icon: CheckCircle2 },
    { id: 'IN_PROGRESS', label: 'En Curso', icon: Package },
    { id: 'COMPLETED', label: 'Finalizada', icon: Flag },
  ];

  if (status === 'CANCELLED') {
    return (
      <div className="w-full bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-3 text-red-700">
        <XCircle size={24} />
        <span className="font-semibold">Esta reserva ha sido cancelada.</span>
      </div>
    );
  }

  // Find current step index
  const currentIndex = steps.findIndex(s => s.id === status);
  
  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center justify-between min-w-[600px] relative">
        {/* Connecting Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
        
        {/* Colored Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-0 transform -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10
                  ${isCompleted ? 'bg-indigo-600 border-indigo-100 text-white' : 'bg-white border-slate-200 text-slate-400'}
                  ${isCurrent ? 'ring-4 ring-indigo-200 scale-110' : ''}
                `}
              >
                <Icon size={18} />
              </div>
              <span 
                className={`text-xs font-semibold whitespace-nowrap ${isCompleted ? 'text-indigo-700' : 'text-slate-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};