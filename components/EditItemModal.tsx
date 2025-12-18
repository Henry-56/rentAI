import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Tag, DollarSign, Type, Trash2 } from 'lucide-react';
import { CATEGORIES, HUANCAYO_CENTER } from '../constants';
import { Item, Coordinates } from '../types';
import { LocationMap } from './LocationMap';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, item: Partial<Item>) => void;
    onDelete: (id: string) => void;
    item: Item | null;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSave, onDelete, item }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: CATEGORIES[1],
        pricePerDay: '',
        location: '',
        imageUrl: '',
        available: true
    });

    const [selectedCoords, setSelectedCoords] = useState<Coordinates>(HUANCAYO_CENTER);

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title,
                description: item.description,
                category: item.category,
                pricePerDay: item.pricePerDay.toString(),
                location: item.location,
                imageUrl: item.imageUrl,
                available: item.available
            });
            if (item.coordinates) {
                setSelectedCoords(item.coordinates);
            }
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(item.id, {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            pricePerDay: Number(formData.pricePerDay),
            location: formData.location,
            imageUrl: formData.imageUrl,
            coordinates: selectedCoords,
            available: formData.available
        });
        onClose();
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.')) {
            onDelete(item.id);
            onClose();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleMapClick = (coords: Coordinates) => {
        setSelectedCoords(coords);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden m-4 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">Editar Artículo</h2>
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
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Ubicación en el Mapa
                            </label>
                            <LocationMap
                                items={[]}
                                center={selectedCoords}
                                zoom={14}
                                height="200px"
                                onMapClick={handleMapClick}
                                showUserLocation={true}
                            />
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
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                            <textarea
                                name="description"
                                required
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                            ></textarea>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="available"
                                    checked={formData.available}
                                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Disponible para alquiler</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 pt-4 border-t border-slate-100 mt-4 shrink-0">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Eliminar
                        </button>
                        <div className="flex gap-3">
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
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
