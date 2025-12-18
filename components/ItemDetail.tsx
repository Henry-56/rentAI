
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, ShieldCheck, MessageCircle, Info, Calendar, Zap, Share2, ShoppingCart, AlertCircle } from 'lucide-react';
import { Item, User } from '../types';
import { PaymentForm } from './PaymentForm';
import { LocationMap } from './LocationMap';

interface ItemDetailProps {
  item: Item;
  owner?: User;
  onBack: () => void;
}

import { rentals } from '../services/api';

export const ItemDetail: React.FC<ItemDetailProps> = ({ item, owner, onBack }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [activeImage, setActiveImage] = useState(item.imageUrl);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentRentalId, setCurrentRentalId] = useState<string | null>(null);
  const [isCreatingRental, setIsCreatingRental] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const getRentalDetails = () => {
    if (!startDate || !endDate) return { days: 0, total: 0, serviceFee: 0, insurance: 15, grandTotal: 0 };

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { days: 0, total: 0, serviceFee: 0, insurance: 15, grandTotal: 0 };
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include start day

    const total = item.pricePerDay * days;
    const serviceFee = total * 0.05;
    const insurance = 15.00;
    const grandTotal = total + serviceFee + insurance;

    return { days, total, serviceFee, insurance, grandTotal };
  };

  const { days, total, serviceFee, insurance, grandTotal } = getRentalDetails();
  const isValidDates = days > 0;

  const handleRentClick = async (isDraft: boolean = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Por favor inicia sesión para reservar.");
      return;
    }

    if (!isValidDates) {
      return;
    }

    setIsCreatingRental(true);
    setError(null); // Clear previous errors
    try {
      const payload = {
        itemId: item.id,
        startDate,
        endDate,
        totalPrice: grandTotal,
        status: isDraft ? 'DRAFT' : 'PENDING_PAYMENT'
      };

      const response = await rentals.create(payload);

      if (isDraft) {
        // Success for cart - we can use alert or a toast. Keeping alert for success for now, focusing on error fix.
        alert("¡Artículo agregado al carrito de compras!");
        onBack();
      } else {
        setCurrentRentalId(response.data.id);
        setStep(2);
      }
    } catch (error: any) {
      console.error("Rental creation error:", error);
      if (error.response?.status === 409) {
        setError(`No disponible: El artículo ya está reservado en estas fechas.`);
      } else {
        setError(error.response?.data?.message || "Error al crear la reserva. Intenta nuevamente.");
      }
    } finally {
      setIsCreatingRental(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep(3);
  };

  const displayOwner = owner || {
    name: 'Propietario RentAI',
    avatarUrl: 'https://picsum.photos/id/64/100/100',
    phoneNumber: '51999999999',
    reviewCount: 0
  };

  const whatsappMessage = encodeURIComponent(`Hola ${displayOwner.name}, estoy interesado en alquilar tu artículo "${item.title}" que vi en RentAI.`);
  const whatsappUrl = `https://wa.me/${displayOwner.phoneNumber}?text=${whatsappMessage}`;

  const thumbnails = [
    item.imageUrl,
    `https://picsum.photos/seed/${item.id}1/600/400`,
    `https://picsum.photos/seed/${item.id}2/600/400`
  ];

  if (step === 3) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-50">
          <ShieldCheck className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">¡Reserva Confirmada!</h2>
        <p className="text-slate-600 mb-8 font-medium">
          El pago de <strong>{item.title}</strong> fue procesado con éxito.
          <br />Coordina la entrega con el dueño por WhatsApp.
        </p>
        <div className="flex flex-col gap-3">
          <a href={whatsappUrl} target="_blank" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2">
            <MessageCircle size={20} /> CONTACTAR DUEÑO
          </a>
          <button onClick={onBack} className="text-slate-500 font-bold hover:underline py-2 uppercase text-[10px] tracking-widest">Volver al catálogo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Navegación y Acciones Rápidas */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <div className="p-2 bg-slate-50 rounded-full group-hover:bg-indigo-50">
            <ArrowLeft size={14} />
          </div>
          VOLVER AL BUSCADOR
        </button>
        <div className="flex gap-4">
          <button className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><Share2 size={16} /></button>
          <span className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">SKU: {item.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* PANEL IZQUIERDO: Imágenes (Col 1-4) */}
        <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-24">
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm">
            <img
              src={activeImage}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {thumbnails.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-indigo-600' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
              </button>
            ))}
          </div>
          <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/50 flex items-center gap-3">
            <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
            <p className="text-[10px] text-indigo-700 font-bold leading-tight uppercase">
              Garantía RentAI: Tu dinero está seguro hasta que confirmes la recepción.
            </p>
          </div>
        </div>

        {/* PANEL CENTRAL: Información (Col 5-8) */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em]">Destacado</span>
              <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                <Star size={12} className="fill-current" />
                <span>{item.rating}</span>
                <span className="text-slate-300 mx-1">•</span>
                <span className="text-slate-400 underline">{item.reviewCount} opiniones</span>
              </div>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">{item.title}</h1>

            <div className="flex items-center gap-5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-600" /> {item.location}</div>
              <div className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-600" /> Disponible hoy</div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-40">Acerca de este artículo</h3>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                {item.description}
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-3xl flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <img src={displayOwner.avatarUrl} className="w-10 h-10 rounded-full border border-white shadow-sm" alt="Owner" />
              <div>
                <p className="font-bold text-slate-900 text-sm leading-none">{displayOwner.name}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">Dueño Verificado</p>
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              className="bg-white p-3 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm border border-slate-100"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        {/* PANEL DERECHO: Pago y Mapa (Col 9-12) */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
          {step === 1 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl relative overflow-hidden">
              <div className="mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Costo de Alquiler</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">S/ {item.pricePerDay}</span>
                  <span className="text-slate-400 font-bold text-xs">/día</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-900 uppercase">Inicio</label>
                  <input
                    type="date"
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-900 uppercase">Fin</label>
                  <input
                    type="date"
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                {isValidDates && (
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <p className="text-[10px] font-bold text-indigo-700 text-center uppercase">
                      {days} {days === 1 ? 'Día' : 'Días'} seleccionados
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8 border-t border-slate-50 pt-4">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                  <span>Tarifa Servicio</span>
                  <span className="text-slate-900">S/ {serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                  <span>Seguro RentAI</span>
                  <span className="text-slate-900">S/ {insurance.toFixed(2)}</span>
                </div>
                {isValidDates && (
                  <div className="flex items-center justify-between text-xs text-indigo-900 font-black uppercase border-t border-indigo-100 pt-2 mt-2">
                    <span>Total Estimado</span>
                    <span className="text-lg">S/ {grandTotal.toFixed(2)}</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 animate-pulse">
                    <p className="text-[10px] font-bold text-red-600 text-center uppercase flex items-center justify-center gap-1">
                      <AlertCircle size={14} /> {error}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => handleRentClick(false)}
                  disabled={!item.available || isCreatingRental || !isValidDates}
                  className={`flex-1 py-5 rounded-2xl font-black text-sm tracking-widest transition-all transform active:scale-95 shadow-xl ${item.available && isValidDates
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                >
                  {isCreatingRental ? 'PROCESANDO...' : (isValidDates ? 'RESERVAR' : 'SELECCIONA FECHAS')}
                </button>

                <button
                  onClick={() => handleRentClick(true)}
                  disabled={!item.available || isCreatingRental || !isValidDates}
                  className={`px-5 py-5 rounded-2xl font-black text-sm tracking-widest transition-all transform active:scale-95 shadow-lg border-2 ${item.available && isValidDates
                    ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-indigo-50'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed hidden'
                    }`}
                  title="Agregar al carrito"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>

              <p className="text-[9px] text-center text-slate-300 font-black mt-4 uppercase tracking-widest">Seguridad Culqi Integrada</p>
            </div>
          ) : (
            <PaymentForm
              rentalId={currentRentalId!}
              itemName={item.title}
              amount={total}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setStep(1)}
            />
          )}

          {/* Mapa Contextual */}
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Ubicación aproximada</h3>
              <MapPin size={14} className="text-indigo-600" />
            </div>
            <LocationMap
              items={[item]}
              center={item.coordinates}
              zoom={14}
              height="180px"
              selectedItemId={item.id}
            />
            <div className="p-3 text-[9px] text-slate-400 text-center font-bold uppercase leading-relaxed tracking-tight">
              Cerca de {item.location} <br />
              <span className="text-indigo-600">Huancayo</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
