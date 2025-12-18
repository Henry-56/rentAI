
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Zap, Info, Lock, ShoppingCart, CreditCard, Loader2 } from 'lucide-react';
import { rentals } from '../services/api';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  itemName?: string;
  rentalId?: string;
  rentalIds?: string[];
}

declare global {
  interface Window {
    Culqi: any;
    culqi: () => void;
  }
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess, onCancel, itemName = 'Alquiler RentAI', rentalId, rentalIds }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCulqiLoaded, setIsCulqiLoaded] = useState(false);

  // LLAVE PÚBLICA PROPORCIONADA
  const CULQI_PUBLIC_KEY = 'pk_test_wTgQXP3I9l9jJ8R8';

  // Usar ref para evitar problemas de closure en el callback global de Culqi
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  // Ref for rentalId to access inside closure
  const rentalIdRef = useRef(rentalId);
  useEffect(() => {
    rentalIdRef.current = rentalId;
  }, [rentalId]);

  // Ref for rentalIds (bulk)
  const rentalIdsRef = useRef(rentalIds);
  useEffect(() => {
    rentalIdsRef.current = rentalIds;
  }, [rentalIds]);

  const serviceFee = amount * 0.05;
  const insurance = 15.00;
  const total = amount + serviceFee + insurance;

  useEffect(() => {
    const initCulqi = () => {
      if (window.Culqi) {
        window.Culqi.publicKey = CULQI_PUBLIC_KEY;
        setIsCulqiLoaded(true);
        console.log("Culqi v4 inicializado correctamente.");
      }
    };

    // Polling por si el script tarda en cargar
    const interval = setInterval(() => {
      if (window.Culqi) {
        initCulqi();
        clearInterval(interval);
      }
    }, 500);

    // Definir la función global que Culqi llamará al generar el token
    window.culqi = async () => {
      if (window.Culqi.token) {
        const token = window.Culqi.token.id;
        setIsProcessing(true);

        try {
          if (rentalIdsRef.current && rentalIdsRef.current.length > 0) {
            await rentals.processBulkPayment(rentalIdsRef.current, token);
          } else if (rentalIdRef.current) {
            await rentals.processPayment(rentalIdRef.current, token);
          } else {
            console.error("No rental ID or IDs provided");
            throw new Error("No rental ID provided for payment");
          }

          setIsProcessing(false);
          // Close Culqi modal first
          if (window.Culqi.close) {
            window.Culqi.close();
          }
          // Allow valid transition
          onSuccessRef.current();
        } catch (error) {
          console.error("Payment processing error:", error);
          alert("Error al procesar el pago. Inténtalo de nuevo.");
          setIsProcessing(false);
        }

      } else if (window.Culqi.order) {
        console.log('Orden generada:', window.Culqi.order);
      } else {
        if (window.Culqi.error) {
          console.error('Error de Culqi:', window.Culqi.error);
          alert('Hubo un problema: ' + (window.Culqi.error.user_message || 'Error desconocido'));
          setIsProcessing(false);
        }
      }
    };

    return () => clearInterval(interval);
  }, []);

  const handleOpenCulqi = () => {
    if (!window.Culqi) {
      alert("La pasarela aún no ha cargado. Por favor, espera un momento.");
      return;
    }

    // 1. Configurar valores del pago
    window.Culqi.settings({
      title: 'Marketplace RentAI',
      currency: 'PEN',
      amount: Math.round(total * 100) // Culqi requiere el monto en céntimos (entero)
    });

    // 2. Configurar opciones visuales y métodos
    window.Culqi.options({
      lang: 'auto',
      installments: true,
      paymentMethods: {
        tarjeta: true,
        yape: true,
        banca_movil: true,
        agente: true,
        cuotealo: false
      },
      style: {
        logo: 'https://cdn-icons-png.flaticon.com/512/3649/3649265.png',
        maincolor: '#4f46e5',
        buttontext: '#ffffff',
        maintext: '#1e293b',
        desctext: '#64748b'
      }
    });

    // 3. Abrir el modal
    window.Culqi.open();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-fade-in-up">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Confirmar Pago</h2>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Transacción Encriptada</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl">
          <ShoppingCart size={20} />
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex justify-between text-xs text-slate-500 font-bold">
          <span>{itemName.slice(0, 25)}...</span>
          <span className="text-slate-900">S/ {amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1">Servicio RentAI <Info size={12} className="text-slate-300" /></span>
          <span className="text-slate-900">S/ {serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1 text-emerald-600 italic">Seguro Contra Todo Riesgo</span>
          <span className="text-slate-900">S/ {insurance.toFixed(2)}</span>
        </div>
        <div className="pt-5 mt-5 border-t border-dashed border-slate-200 flex justify-between items-end">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total a Pagar</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">S/ {total.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-1 text-[8px] text-slate-300 font-black tracking-tighter uppercase">
            <Lock size={10} /> PROTEGIDO
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleOpenCulqi}
          disabled={isProcessing || !isCulqiLoaded}
          className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-md hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              {isCulqiLoaded ? 'REALIZAR PAGO' : 'CARGANDO...'} <CreditCard size={18} />
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full py-1 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          Volver atrás
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
        <img src="https://logodownload.org/wp-content/uploads/2014/07/american-express-logo-0.png" className="h-3" alt="Amex" />
      </div>
    </div>
  );
};
