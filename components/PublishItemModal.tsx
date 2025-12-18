import React, { useState } from 'react';
import { X, Upload, MapPin, Tag, DollarSign, Type } from 'lucide-react';
import { CATEGORIES, HUANCAYO_CENTER } from '../constants';
import { Item, Coordinates } from '../types';
import { LocationMap } from './LocationMap';

interface PublishItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (item: Omit<Item, 'id' | 'ownerId' | 'available' | 'rating' | 'reviewCount'>) => void;
}

export const PublishItemModal: React.FC<PublishItemModalProps> = ({ isOpen, onClose, onPublish }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[1], // Default to first actual category
    pricePerDay: '',
    location: '',
    imageUrl: ''
  });
  
  // State for coordinates, defaulting to Huancayo Center
  const [selectedCoords, setSelectedCoords] = useState<Coordinates>(HUANCAYO_CENTER);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPublish({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        pricePerDay: Number(formData.pricePerDay),
        location: formData.location,
        imageUrl: formData.imageUrl || 'https://picsum.photos/800/600', // Fallback
        coordinates: selectedCoords
    });
    onClose();
    // Reset form
    setFormData({
        title: '',
        description: '',
        category: CATEGORIES[1],
        pricePerDay: '',
        location: '',
        imageUrl: ''
    });
    setSelectedCoords(HUANCAYO_CENTER);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMapClick = (coords: Coordinates) => {
    setSelectedCoords(coords);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden m-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Publicar Nuevo Artículo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del Artículo</label>
                <div className="relative">
                    <Type className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej. Cámara Canon EOS R5"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <div className="relative">
                    <Tag className="absolute left-3 top-3 text-slate-400" size={16} />
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white appearance-none"
                    >
                        {CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio por Día (S/)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                    type="number"
                    name="pricePerDay"
                    required
                    min="1"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (Referencia)</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ej. El Tambo, San Carlos..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                </div>
            </div>

            {/* Map Picker */}
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ubicación Exacta en el Mapa <span className="text-xs text-indigo-500 font-normal">(Haz clic para marcar)</span>
                </label>
                <LocationMap 
                    items={[]} // No items to display initially, just the picker
                    center={selectedCoords}
                    zoom={14}
                    height="200px"
                    onMapClick={handleMapClick}
                    showUserLocation={true} // Shows the selected pin
                />
                 <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>Lat: {selectedCoords.lat.toFixed(4)}</span>
                    <span>Lng: {selectedCoords.lng.toFixed(4)}</span>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">URL de la Imagen</label>
                <div className="relative">
                    <Upload className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                    type="url"
                    name="imageUrl"
                    required
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                </div>
                <p className="text-xs text-slate-500 mt-1">Usa una URL pública de imagen.</p>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe las características y condiciones del artículo..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition-all transform hover:scale-105"
            >
              Publicar Artículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};