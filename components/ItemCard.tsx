import React from 'react';
import { Star, MapPin, Navigation, Info } from 'lucide-react';
import { Item } from '../types';
import { formatDistance } from '../utils/geoUtils';

interface ItemCardProps {
  item: Item;
  onClick: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  return (
    <div
      className="group bg-white flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => onClick(item)}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100 rounded-md">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        {item.isRentedToday && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm z-10">
            Rentado
          </div>
        )}
        {!item.available && !item.isRentedToday && (
          <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase px-2 py-1 rounded">
            No Disponible
          </div>
        )}
      </div>

      <div className="py-3 flex flex-col flex-1">
        <h3 className="text-base font-medium text-slate-900 line-clamp-2 group-hover:text-indigo-600 group-hover:underline transition-all mb-1 leading-tight">
          {item.title}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5 text-slate-700">
            <span className="text-xs font-bold">{item.rating}</span>
            <Star size={12} className="fill-slate-700" />
          </div>
          <span className="text-xs text-slate-400">({item.reviewCount})</span>
        </div>

        <div className="mt-auto space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">S/ {item.pricePerDay.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-medium">/día</span>
          </div>

          <p className="text-xs font-bold text-green-600">Alquiler directo</p>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
            <MapPin size={10} />
            <span>Desde {item.location}</span>
            {item.distance !== undefined && (
              <>
                <span className="mx-1">•</span>
                <span className="text-indigo-600">{formatDistance(item.distance)}</span>
              </>
            )}
          </div>

          <div className="pt-2">
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              Vendedor verificado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};