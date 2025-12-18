
import React, { useState } from 'react';
import { Calendar, MessageCircle, X, CreditCard, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { RentalTransaction } from '../types';
import { RentalTimeline } from './RentalTimeline';
import { PaymentForm } from './PaymentForm';
import { RatingModal } from './RatingModal';

interface RenterDashboardProps {
  rentals: RentalTransaction[];
  onPaymentSuccess: (rentalId: string) => void;
  onRateSuccess: (rentalId: string, rating: number, comment: string) => void;
}

export const RenterDashboard: React.FC<RenterDashboardProps> = ({ rentals, onPaymentSuccess, onRateSuccess }) => {
  const [selectedPaymentRental, setSelectedPaymentRental] = useState<RentalTransaction | null>(null);
  const [selectedRatingRental, setSelectedRatingRental] = useState<RentalTransaction | null>(null);

  const handlePay = (rental: RentalTransaction) => {
    setSelectedPaymentRental(rental);
  };

  const handlePaymentComplete = () => {
    if (selectedPaymentRental) {
      onPaymentSuccess(selectedPaymentRental.id);
      setSelectedPaymentRental(null);
    }
  };

  const handleRate = (rental: RentalTransaction) => {
    setSelectedRatingRental(rental);
  };

  const handleRatingSubmit = (rating: number, comment: string) => {
    if (selectedRatingRental) {
      onRateSuccess(selectedRatingRental.id, rating, comment);
      setSelectedRatingRental(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Alquileres</h1>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl text-indigo-700 text-xs font-bold border border-indigo-100">
          <ShieldCheck size={16} />
          Protección RentAI activa
        </div>
      </div>

      {rentals.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="text-indigo-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes alquileres</h3>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Explora el catálogo y encuentra lo que necesitas hoy mismo.</p>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {rentals.map((rental) => (
            <div key={rental.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              {/* Status Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${rental.status === 'PENDING_PAYMENT' ? 'bg-amber-400' :
                    rental.status === 'IN_PROGRESS' ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`}></div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    {rental.status.replace('_', ' ')}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs font-medium text-slate-500">#{rental.id.slice(0, 8)}</span>
                </div>

                <div className="flex items-center gap-3">
                  {rental.status === 'PENDING_PAYMENT' && (
                    <button
                      onClick={() => handlePay(rental)}
                      className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2 group/btn"
                    >
                      <CreditCard size={14} />
                      Pagar S/ {rental.totalPrice}
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {rental.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleRate(rental)}
                      className="bg-amber-100 text-amber-700 px-6 py-2 rounded-xl text-xs font-black hover:bg-amber-200 transition-all flex items-center gap-2"
                    >
                      <Star size={14} className="fill-amber-700" />
                      CALIFICAR EXPERIENCIA
                    </button>
                  )}
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Main Info */}
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="w-full md:w-48 h-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner">
                    <img src={rental.itemImage} alt={rental.itemTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{rental.itemTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {rental.startDate} al {rental.endDate}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tight">Dueño: {rental.renterName}</div>
                      <div className="px-3 py-1 bg-indigo-50 rounded-lg text-[10px] font-bold text-indigo-600 uppercase tracking-tight">Seguro incluido</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total abonado</p>
                    <p className={`text-3xl font-black ${rental.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>S/ {rental.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                {rental.status !== 'CANCELLED' ? (
                  <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100">
                    <RentalTimeline status={rental.status} />
                  </div>
                ) : (
                  <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                    <p className="text-red-600 font-bold mb-2">Solicitud Rechazada</p>
                    <p className="text-xs text-red-500">El dueño no puede aceptar tu solicitud en estas fechas. Se ha procesado el reembolso de tu pago.</p>
                  </div>
                )}

                <div className={`mt-6 flex items-center gap-3 text-sm p-4 rounded-2xl border ${rental.status === 'CANCELLED' ? 'bg-red-50/50 border-red-50 text-red-600' : 'bg-indigo-50/30 border-indigo-50/50 text-slate-500'
                  }`}>
                  <div className={`p-2 rounded-xl shadow-sm ${rental.status === 'CANCELLED' ? 'bg-white text-red-500' : 'bg-white text-indigo-600'}`}>
                    <ShieldCheck size={18} />
                  </div>
                  <span>
                    {rental.status === 'PENDING_PAYMENT' && "Tu reserva expira en 2 horas si no se realiza el pago."}
                    {rental.status === 'IN_REVIEW' && "Hemos notificado al dueño. Recibirás una respuesta en menos de 30 min."}
                    {rental.status === 'CONFIRMED' && "Reserva confirmada. El propietario se contactará para la entrega."}
                    {rental.status === 'IN_PROGRESS' && "Alquiler en curso. Tienes soporte prioritario 24/7."}
                    {rental.status === 'COMPLETED' && "¡Gracias por confiar en RentAI! Tu reseña ayuda a la comunidad."}
                    {rental.status === 'CANCELLED' && "El dinero será devuelto a tu tarjeta en 3-5 días hábiles."}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Gateway Modal */}
      {selectedPaymentRental && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fade-in p-4">
          <div className="w-full max-w-md relative animate-fade-in-up">
            <button
              onClick={() => setSelectedPaymentRental(null)}
              className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
            <PaymentForm
              rentalId={selectedPaymentRental.id}
              amount={selectedPaymentRental.totalPrice}
              onSuccess={handlePaymentComplete}
              onCancel={() => setSelectedPaymentRental(null)}
            />
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={!!selectedRatingRental}
        onClose={() => setSelectedRatingRental(null)}
        onSubmit={handleRatingSubmit}
        itemName={selectedRatingRental?.itemTitle || ''}
      />
    </div>
  );
};
