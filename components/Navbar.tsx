import React from 'react';
import { ShoppingBag, Bell, Heart, ShoppingCart, ChevronDown, Search } from 'lucide-react';
import { User, UserRole } from '../types';
import { CATEGORIES } from '../constants';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchRole: () => void;
  onNavigate: (page: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
  onNavigate,
  selectedCategory,
  onCategoryChange,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = () => {
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="border-b border-slate-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-8 flex justify-between items-center text-[12px] text-slate-600">
          <div className="flex gap-4 items-center">
            {currentUser ? (
              <span className="flex items-center gap-1">
                Hola, <strong className="text-slate-900">{currentUser.name.split(' ')[0]}</strong>!
                <button onClick={onLogout} className="text-indigo-600 hover:underline ml-2">Cerrar sesión</button>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Hola! <button onClick={() => onNavigate('login')} className="text-indigo-600 hover:underline font-bold">Inicia sesión</button> o <button onClick={() => onNavigate('register')} className="text-indigo-600 hover:underline font-bold">Regístrate</button>
              </span>
            )}
            <a href="#" className="hover:underline">Ofertas del día</a>
            <a href="#" className="hover:underline">Ayuda y contacto</a>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={onSwitchRole} className="hover:underline font-medium text-indigo-600">
              Vender ({currentUser?.role === UserRole.OWNER ? 'Modo Dueño' : 'Modo Arrendatario'})
            </button>
            <a href="#" className="hover:underline flex items-center gap-1">Lista de artículos guardados <ChevronDown size={12} /></a>
            <button onClick={() => onNavigate('my-rentals')} className="hover:underline">Mi RentAI</button>
            <button className="relative"><Bell size={16} /></button>
            <button onClick={() => onNavigate('cart')} className="relative group">
              <ShoppingCart size={18} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
              {/* Badge placeholder - logic handled in parent or we assume 0 for now until passed */}
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Bar Area */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div
          className="flex-shrink-0 cursor-pointer flex items-center gap-1"
          onClick={() => onNavigate('home')}
        >
          <ShoppingBag className="h-10 w-10 text-indigo-600" />
          <span className="text-3xl font-black tracking-tighter italic">
            <span className="text-red-500">R</span>
            <span className="text-blue-500">e</span>
            <span className="text-amber-500">n</span>
            <span className="text-green-500">t</span>
            <span className="text-indigo-600">AI</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center text-sm text-slate-500 gap-1 cursor-pointer hover:text-slate-800 shrink-0 group">
          Comprar por <br />
          <span className="font-bold flex items-center text-slate-900 -mt-1 group-hover:underline">categoría <ChevronDown size={14} /></span>
        </div>

        {/* Global Search */}
        <div className="flex-1 flex items-center max-w-3xl">
          <div className="relative flex-1 flex items-center border-2 border-slate-900 focus-within:border-indigo-600 overflow-hidden rounded-l-sm">
            <div className="absolute left-3 text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Busca cualquier artículo en Huancayo..."
              className="w-full pl-10 pr-4 py-2 text-base outline-none border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            <div className="h-6 w-px bg-slate-300 mx-2"></div>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent text-sm font-medium pr-8 pl-2 outline-none border-none cursor-pointer hidden md:block max-w-[150px] truncate"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearchSubmit}
            className="bg-indigo-600 text-white px-10 py-[10.5px] font-bold text-sm hover:bg-indigo-700 transition-colors rounded-r-sm border-2 border-indigo-600 -ml-[2px] shadow-sm"
          >
            Buscar
          </button>
          <button onClick={() => onNavigate('cart')} className="ml-4 text-[12px] text-slate-500 hover:underline hidden lg:flex flex-col items-center leading-none gap-1 font-bold">
            <ShoppingCart size={20} className="text-indigo-600" /> Carrito
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div className="md:hidden flex justify-around py-2 border-t border-slate-100 text-xs text-slate-500 bg-white">
        <button onClick={() => onNavigate('home')} className="flex flex-col items-center gap-1 text-indigo-600"><ShoppingBag size={20} /> Inicio</button>
        <button onClick={() => onNavigate('my-rentals')} className="flex flex-col items-center gap-1"><Heart size={20} /> Guardados</button>
        <button onClick={() => onNavigate('home')} className="flex flex-col items-center gap-1"><Search size={20} /> Buscar</button>
        <button onClick={onSwitchRole} className="flex flex-col items-center gap-1"><ChevronDown size={20} /> Mi RentAI</button>
      </div>
    </header>
  );
};