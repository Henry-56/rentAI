import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { RentalTransaction } from '../types';
import { rentals as rentalsApi } from '../services/api';
import { PaymentForm } from './PaymentForm';

interface CartProps {
    cartItems: RentalTransaction[];
    onRefresh: () => void;
    onNavigate: (page: string) => void;
}

export const Cart: React.FC<CartProps> = ({ cartItems, onRefresh, onNavigate }) => {
    const [isPaying, setIsPaying] = useState(false);

    // Calculate totals
    const subTotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    // Service fee is roughly 5% of item price implied in total? 
    // Wait, in ItemDetail we sent the GRAND total as totalPrice. 
    // So totalPrice in Rental DB is already the final price.
    // Actually, let's verify ItemDetail logic: 
    // const grandTotal = total + serviceFee + insurance;
    // rentals.create({ ..., totalPrice: grandTotal });
    // So yes, totalPrice is the final amount to pay.

    const totalToPay = subTotal;

    const handleRemove = async (id: string) => {
        if (!confirm("¿Estás seguro de quitar este item del carrito?")) return;
        try {
            await rentalsApi.updateStatus(id, 'CANCELLED');
            onRefresh();
        } catch (error) {
            console.error("Error removing item:", error);
            alert("Error al eliminar item");
        }
    };

    const handlePaymentSuccess = () => {
        alert("¡Pago realizado con éxito! Tus alquileres están confirmados.");
        setIsPaying(false);
        onRefresh(); // Should clear the cart as items move to IN_REVIEW
        onNavigate('my-rentals');
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center px-4">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="h-10 w-10 text-slate-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Tu carrito está vacío</h2>
                <p className="text-slate-500 mb-8 max-w-sm">Explora nuestro catálogo y encuentra el equipo perfecto para tu próximo proyecto.</p>
                <button
                    onClick={() => onNavigate('home')}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                    Explorar Catálogo <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    if (isPaying) {
        return (
            <div className="max-w-md mx-auto py-10 px-4">
                <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Finalizar Compra</h2>
                <PaymentForm
                    rentalId="" // ignored since we pass rentalIds
                    rentalIds={cartItems.map(i => i.id)}
                    itemName={`Compra de ${cartItems.length} items`}
                    amount={totalToPay}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setIsPaying(false)}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <h1 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <ShoppingBag className="text-indigo-600" /> Carrito de Compras
                <span className="text-sm font-medium bg-slate-100 px-3 py-1 rounded-full text-slate-500">{cartItems.length} items</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 transition-all hover:border-indigo-100">
                            <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                <img src={item.itemImage} alt={item.itemTitle} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 truncate">{item.itemTitle}</h3>
                                <div className="text-xs text-slate-500 mt-1 space-y-1">
                                    <p>Inicio: {new Date(item.startDate).toLocaleDateString()}</p>
                                    <p>Fin: {new Date(item.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between items-end">
                                <span className="font-black text-slate-900">S/ {item.totalPrice}</span>
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-4 text-lg">Resumen</h3>

                        <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>S/ {totalToPay.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                <span>Descuentos</span>
                                <span>- S/ 0.00</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xl font-black text-slate-900 mb-8">
                            <span>Total</span>
                            <span>S/ {totalToPay.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => setIsPaying(true)}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                        >
                            PAGAR TODO (S/ {totalToPay.toFixed(2)})
                        </button>

                        <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-400 leading-tight">
                            <AlertCircle size={14} className="shrink-0" />
                            <p>Al procesar el pago aceptas nuestros términos y condiciones de alquiler.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
