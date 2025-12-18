import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

export const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('rentai_cookie_consent');
        if (!consent) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('rentai_cookie_consent', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        // Optionally handle decline (e.g., save 'false' or just close)
        // For now, we'll just close it, but maybe remind them later
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none animate-fade-in-up">
            <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 max-w-2xl w-full flex flex-col md:flex-row items-center gap-6 pointer-events-auto ring-1 ring-slate-900/5">
                <div className="bg-indigo-100/50 p-3 rounded-2xl shrink-0">
                    <Cookie size={32} className="text-indigo-600" />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-sm font-black text-slate-900 mb-1">Valoramos tu privacidad</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        Utilizamos cookies para mejorar tu experiencia en RentAI, analizar el tráfico y personalizar el contenido.
                        Al continuar navegando, aceptas nuestra política de uso de datos.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    >
                        Configurar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 active:scale-95 flex items-center gap-2"
                    >
                        <Check size={14} /> Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};
