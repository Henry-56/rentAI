import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, DollarSign, Package, Calendar, Map as MapIcon, List, Kanban, TrendingUp, ShieldCheck, ArrowRight, Clock, Search, Filter, AlertCircle, CheckCircle2, PlayCircle } from 'lucide-react';
import { Item, MonthlyIncome, RentalTransaction, RentalStatus } from '../types';
import { PublishItemModal } from './PublishItemModal';
import { EditItemModal } from './EditItemModal';
import { LocationMap } from './LocationMap';
import { OwnerRentalPipeline } from './OwnerRentalPipeline';
import { HUANCAYO_CENTER } from '../constants';

const MOCK_INCOME_DATA: MonthlyIncome[] = [
    { month: 'Ene', amount: 1200 },
    { month: 'Feb', amount: 1800 },
    { month: 'Mar', amount: 1400 },
    { month: 'Abr', amount: 2200 },
    { month: 'May', amount: 2800 },
    { month: 'Jun', amount: 2400 },
];

interface OwnerDashboardProps {
    items: Item[];
    rentals: RentalTransaction[];
    onAddItem: (item: Omit<Item, 'id' | 'ownerId' | 'available' | 'rating' | 'reviewCount'>) => void;
    onUpdateRentalStatus: (rentalId: string, status: RentalStatus) => void;
    onEditItem: (id: string, item: Partial<Item>) => void;
    onDeleteItem: (id: string) => void;
    onMessage?: (rental: RentalTransaction) => void;
    onInfo?: (rental: RentalTransaction) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ items, rentals, onAddItem, onUpdateRentalStatus, onEditItem, onDeleteItem, onMessage, onInfo }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItemToEdit, setSelectedItemToEdit] = useState<Item | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'rentals'>('overview');
    const [showMap, setShowMap] = useState(false);

    // Filters for Rentals
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<RentalStatus | 'ALL'>('ALL');

    const totalIncome = MOCK_INCOME_DATA.reduce((acc, curr) => acc + curr.amount, 0);
    const totalItems = items.length;
    const activeRentalsCount = rentals.filter(r => r.status === 'IN_PROGRESS' || r.status === 'CONFIRMED').length;
    const pendingReviewsCount = rentals.filter(r => r.status === 'IN_REVIEW').length;

    const filteredRentals = useMemo(() => {
        return rentals.filter(r => {
            const matchesSearch = r.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.renterName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rentals, searchQuery, statusFilter]);

    const handleOpenEdit = (item: Item) => {
        setSelectedItemToEdit(item);
        setIsEditModalOpen(true);
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in min-h-screen flex flex-col">

                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Workspace Dueño</span>
                            <div className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                                <TrendingUp size={10} /> +12% este mes
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tu Negocio en RentAI</h1>
                        <p className="text-slate-500 font-medium mt-1">Gestiona tus activos y monitorea tus ingresos en la red de Huancayo.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100/50 p-1.5 rounded-2xl flex gap-1 border border-slate-200/50">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100/50' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Kanban size={14} /> Resumen
                            </button>
                            <button
                                onClick={() => setActiveTab('rentals')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'rentals' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100/50' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List size={14} /> Gestión de Alquileres
                            </button>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Publicar Articulo</span>
                        </button>
                    </div>
                </div>

                {activeTab === 'rentals' ? (
                    <div className="flex-1 overflow-hidden animate-slide-up space-y-8">
                        {/* Quick Summary Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Package size={18} />
                                </div>
                                <div>
                                    <p className="text-base font-black text-slate-900">{rentals.length}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Operaciones</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${pendingReviewsCount > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                                    <AlertCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-base font-black text-slate-900">{pendingReviewsCount}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Por Confirmar</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <PlayCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-base font-black text-slate-900">{activeRentalsCount}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Alquileres en curso</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <p className="text-base font-black text-slate-900">{rentals.filter(r => r.status === 'COMPLETED').length}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Completados</p>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Search & Filter Bar */}
                        <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por artículo o cliente..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="shrink-0 text-slate-400 px-2">
                                    <Filter size={18} />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="bg-slate-50 border-none rounded-2xl py-3 px-6 text-[10px] font-black uppercase text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
                                >
                                    <option value="ALL">Todos los estados</option>
                                    <option value="IN_REVIEW">Por Confirmar</option>
                                    <option value="CONFIRMED">Confirmados</option>
                                    <option value="IN_PROGRESS">En Curso</option>
                                    <option value="COMPLETED">Finalizados</option>
                                    <option value="PENDING_PAYMENT">Esperando Pago</option>
                                </select>
                            </div>
                        </div>

                        <OwnerRentalPipeline
                            rentals={filteredRentals}
                            onUpdateStatus={onUpdateRentalStatus}
                            onMessage={onMessage}
                            onInfo={onInfo}
                        />
                    </div>
                ) : (
                    <>
                        {/* Stats Cards - Premium Style */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
                                <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-110 transition-transform">
                                    <DollarSign size={80} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ingresos Estimados</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">S/ {totalIncome.toLocaleString()}</p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase">
                                    <TrendingUp size={12} /> Creciendo
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
                                <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:scale-110 transition-transform">
                                    <Package size={80} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventario Total</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{totalItems}</p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase">
                                    <Package size={12} /> Artículos Online
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
                                <div className="absolute top-0 right-0 p-8 text-purple-500/10 group-hover:scale-110 transition-transform">
                                    <Calendar size={80} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operaciones Hoy</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{activeRentalsCount}</p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase">
                                    <Clock size={12} /> Alquileres Activos
                                </div>
                            </div>
                        </div>

                        {/* Income Insights */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Gráfico de Rendimiento</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tendencia de ingresos mensuales</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500">6 Meses</button>
                                    <button className="bg-indigo-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-indigo-600">12 Meses</button>
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={MOCK_INCOME_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} tickFormatter={(value) => `S/${value}`} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '15px' }}
                                            itemStyle={{ fontWeight: 900, color: '#4f46e5' }}
                                            labelStyle={{ fontWeight: 900, marginBottom: '5px', textTransform: 'uppercase', fontSize: '10px' }}
                                        />
                                        <Bar dataKey="amount" fill="#4f46e5" radius={[12, 12, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Inventory Section */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Inventario de Equipos</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestiona la disponibilidad de tus artículos</p>
                                </div>

                                {/* View Toggle */}
                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                                    <button
                                        onClick={() => setShowMap(false)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${!showMap ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <List size={14} /> Lista
                                    </button>
                                    <button
                                        onClick={() => setShowMap(true)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${showMap ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <MapIcon size={14} /> Mapa
                                    </button>
                                </div>
                            </div>

                            {showMap ? (
                                <div className="p-10 animate-fade-in">
                                    <div className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner">
                                        <LocationMap
                                            items={items}
                                            height="500px"
                                            zoom={13}
                                            center={HUANCAYO_CENTER}
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 mt-6 text-center uppercase tracking-widest opacity-60">Visualizando ubicación de {items.length} artículos en la zona de Huancayo.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            <tr>
                                                <th className="px-10 py-5">Información Artículo</th>
                                                <th className="px-6 py-5">Categoría</th>
                                                <th className="px-6 py-5">Disponibilidad</th>
                                                <th className="px-6 py-5">Precio Diario</th>
                                                <th className="px-10 py-5 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {items.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={item.title} />
                                                            <div>
                                                                <p className="font-black text-slate-900 text-sm tracking-tight">{item.title}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 truncate max-w-[200px]">{item.location}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 font-bold text-slate-600 text-xs">{item.category}</td>
                                                    <td className="px-6 py-6">
                                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.available
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {item.available ? '● Listado' : '○ En Alquiler'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <span className="font-black text-slate-900">S/ {item.pricePerDay}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold ml-1">/ día</span>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <button
                                                            onClick={() => handleOpenEdit(item)}
                                                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest"
                                                        >
                                                            Editar <ArrowRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-10 py-20 text-center opacity-30">
                                                        <div className="flex flex-col items-center">
                                                            <Package size={48} className="mb-4 text-slate-900" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest">No tienes artículos publicados aún.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <PublishItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPublish={onAddItem}
            />

            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={onEditItem}
                onDelete={onDeleteItem}
                item={selectedItemToEdit}
            />
        </>
    );
};