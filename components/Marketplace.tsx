
import React, { useState, useMemo } from 'react';
/* Added missing Zap icon import */
import { Search, Map as MapIcon, Navigation, LayoutList, Zap } from 'lucide-react';
import { ItemCard } from './ItemCard';
import { LocationMap } from './LocationMap';
import { Item, Coordinates } from '../types';
import { CATEGORIES, HUANCAYO_CENTER } from '../constants';
import { calculateDistance, formatDistance } from '../utils/geoUtils';

interface MarketplaceProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ 
  items: initialItems, 
  onItemClick,
  selectedCategory,
  onCategoryChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  const filteredItems = useMemo(() => {
    let results = initialItems;
    if (userLocation) {
        results = results.map(item => ({
            ...item,
            distance: calculateDistance(userLocation, item.coordinates)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    return results.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
      const matchesPrice = item.pricePerDay >= priceRange[0] && item.pricePerDay <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [initialItems, searchTerm, selectedCategory, userLocation, priceRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-white">
      <div className="flex gap-8">
        {/* Sidebar Filters - Classic eBay Style */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-tight">Categoría</h3>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => onCategoryChange(cat)}
                    className={`text-sm hover:underline text-left w-full block py-1 px-2 rounded-md transition-colors ${selectedCategory === cat ? 'font-bold text-slate-900 bg-slate-50' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-tight">Precio por día</h3>
            <div className="space-y-4">
               <input 
                 type="range" 
                 min="0" 
                 max="500" 
                 step="10"
                 value={priceRange[1]}
                 onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                 className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
               />
               <div className="flex justify-between text-xs font-bold text-slate-600">
                 <span>S/ 0</span>
                 <span>S/ {priceRange[1]}</span>
               </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-tight">Estado del artículo</h3>
            <div className="space-y-2">
               {['Como nuevo', 'Usado', 'Profesional'].map(condition => (
                 <label key={condition} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                   <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                   {condition}
                 </label>
               ))}
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-8">
            <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-widest">Patrocinado</p>
            <div className="aspect-[4/3] bg-slate-200 rounded-lg mb-3 flex items-center justify-center">
              <Zap size={24} className="text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-900">Seguro RentAI Premium</p>
            <p className="text-[10px] text-slate-500 mt-1">Protege tus equipos contra todo riesgo durante el alquiler.</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {filteredItems.length} resultados para <span className="text-indigo-600 font-black italic">"{selectedCategory}"</span>
              </h1>
              {userLocation && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Navigation size={12} className="text-indigo-600 fill-indigo-600" /> 
                  Mostrando resultados más cercanos a tu ubicación
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={handleGetLocation}
                  className="text-xs font-bold text-indigo-600 hover:underline mr-4"
                >
                  Usar mi ubicación
                </button>
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                <div className="flex border border-slate-300 rounded overflow-hidden">
                   <button 
                    onClick={() => setShowMap(false)}
                    className={`p-1.5 transition-colors ${!showMap ? 'bg-slate-100 text-indigo-600' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                   >
                     <LayoutList size={18} />
                   </button>
                   <button 
                    onClick={() => setShowMap(true)}
                    className={`p-1.5 transition-colors ${showMap ? 'bg-slate-100 text-indigo-600' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                   >
                     <MapIcon size={18} />
                   </button>
                </div>
            </div>
          </div>

          {showMap ? (
            <LocationMap 
              items={filteredItems} 
              height="600px" 
              center={userLocation || HUANCAYO_CENTER}
              zoom={13}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} onClick={onItemClick} />
              ))}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-lg">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-300" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">No hay coincidencias exactas.</h3>
               <p className="text-slate-500 mt-2">Prueba cambiando los filtros o la categoría.</p>
               <button 
                onClick={() => onCategoryChange('Todos')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition-colors"
               >
                 Ver todas las categorías
               </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
