import React, { useState } from 'react';
import { RentalTransaction, RentalStatus } from '../types';
import { Calendar, Check, Clock, MessageSquare, DollarSign, Info, Zap, ShieldCheck } from 'lucide-react';

interface OwnerRentalPipelineProps {
  rentals: RentalTransaction[];
  onUpdateStatus: (rentalId: string, newStatus: RentalStatus) => void;
  onMessage?: (rental: RentalTransaction) => void;
  onInfo?: (rental: RentalTransaction) => void;
}

const RentalCard: React.FC<{
  rental: RentalTransaction;
  onAction: (action: 'confirm' | 'reject' | 'start' | 'finish' | 'message' | 'info') => void;
}> = ({ rental, onAction }) => {
  const isPending = rental.status === 'PENDING_PAYMENT';
  const isReview = rental.status === 'IN_REVIEW';
  const isConfirmed = rental.status === 'CONFIRMED';
  const isInProgress = rental.status === 'IN_PROGRESS';
  const isCompleted = rental.status === 'COMPLETED';

  // Calculations
  const insuranceAmount = 15.00;
  const platformFee = rental.totalPrice * 0.05;
  const netIncome = rental.totalPrice - insuranceAmount - platformFee;

  const startDate = new Date(rental.startDate);
  const now = new Date();
  const diffTime = startDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group/card relative overflow-hidden ${isReview ? 'ring-1 ring-amber-100' : ''}`}>
      {/* Visual Status Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${isPending ? 'bg-slate-200' :
        isReview ? 'bg-amber-400' :
          isConfirmed ? 'bg-indigo-500' :
            isInProgress ? 'bg-purple-500' : 'bg-emerald-500'
        }`}></div>

      <div className="flex gap-4 mb-5 pl-2">
        <div className="relative shrink-0">
          <img src={rental.itemImage} className="w-16 h-16 rounded-[1.2rem] object-cover bg-slate-100 shadow-sm" alt={rental.itemTitle} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-black text-slate-900 truncate tracking-tight mb-1 pr-4 leading-tight">{rental.itemTitle}</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black border border-indigo-100 uppercase">
              {rental.renterName ? rental.renterName.charAt(0) : '?'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-700 truncate">{rental.renterName || 'Cliente Desconocido'}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ID: #{rental.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6 pl-2">
        {/* Date Segment */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-indigo-500" />
            <div className="leading-tight">
              <p className="text-[11px] font-black text-slate-900">{new Date(rental.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(rental.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Periodo</p>
            </div>
          </div>
          {isConfirmed && (
            <div className="text-right">
              <p className="text-[11px] font-black text-indigo-600">{diffDays > 0 ? `En ${diffDays} días` : 'Empieza hoy'}</p>
            </div>
          )}
        </div>

        {/* Price Segment */}
        <div className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-2xl">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Total</p>
            <p className="text-xs font-black text-slate-900">S/ {rental.totalPrice.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-indigo-400 uppercase mb-0.5">Ganancia</p>
            <p className="text-sm font-black text-indigo-600">S/ {netIncome.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 pl-2">
        <div className="flex gap-2">
          <button
            onClick={() => onAction('message')}
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <MessageSquare size={16} />
          </button>
          <button
            onClick={() => onAction('info')}
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600"
          >
            <Info size={16} />
          </button>
        </div>

        <div className="flex gap-2">
          {isReview && (
            <>
              <button
                onClick={() => onAction('reject')}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={() => onAction('confirm')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                Aceptar
              </button>
            </>
          )}

          {isInProgress && (
            <button
              onClick={() => onAction('finish')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 flex items-center gap-2"
            >
              <Check size={14} /> Finalizar
            </button>
          )}

          {isCompleted && (
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              Finalizado
            </span>
          )}

          {isPending && (
            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              Esperando Pago
            </span>
          )}

          {isConfirmed && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                <Clock size={14} className="animate-spin-slow" /> LISTO
              </div>
              <button
                onClick={() => onAction('start')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                Entregar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const OwnerRentalPipeline: React.FC<OwnerRentalPipelineProps> = ({ rentals, onUpdateStatus, onMessage, onInfo }) => {
  const [activeTab, setActiveTab] = useState<RentalStatus | 'ALL'>('IN_REVIEW');

  const tabs = [
    { id: 'IN_REVIEW', label: 'Por Confirmar', icon: <Clock size={14} />, color: 'text-amber-500' },
    { id: 'CONFIRMED', label: 'Próximos', icon: <Calendar size={14} />, color: 'text-indigo-500' },
    { id: 'IN_PROGRESS', label: 'En Curso', icon: <Zap size={14} />, color: 'text-purple-500' },
    { id: 'COMPLETED', label: 'Historial', icon: <ShieldCheck size={14} />, color: 'text-emerald-500' },
    { id: 'PENDING_PAYMENT', label: 'Sin Pago', icon: <DollarSign size={14} />, color: 'text-slate-400' },
  ];

  const filteredRentals = activeTab === 'ALL' ? rentals : rentals.filter(r => r.status === activeTab);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const count = rentals.filter(r => r.status === tab.id).length;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                }`}
            >
              <span className={`transition-colors ${isActive ? tab.color : 'text-slate-400'}`}>{tab.icon}</span>
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Content */}
      {filteredRentals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredRentals.map(r => (
            <RentalCard
              key={r.id}
              rental={r}
              onAction={(action) => {
                if (action === 'confirm') onUpdateStatus(r.id, 'CONFIRMED');
                if (action === 'reject') onUpdateStatus(r.id, 'CANCELLED');
                if (action === 'start') onUpdateStatus(r.id, 'IN_PROGRESS');
                if (action === 'finish') onUpdateStatus(r.id, 'COMPLETED');
                if (action === 'message' && onMessage) onMessage(r);
                if (action === 'info' && onInfo) onInfo(r);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center animate-fade-in">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Info size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Nada por aquí</h3>
          <p className="text-sm font-bold text-slate-400 max-w-xs">
            No hay alquileres en la etapa <br />
            <span className="text-indigo-600 uppercase tracking-widest text-xs">
              {tabs.find(t => t.id === activeTab)?.label}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};