import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  itemName: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, itemName }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
    // Reset
    setRating(0);
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden m-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Calificar Alquiler</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-slate-600 text-sm mb-4 text-center">
            ¿Qué tal estuvo tu experiencia con <strong>{itemName}</strong>?
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star 
                  size={32} 
                  className={`${(hoveredStar || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                />
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Comentario (Opcional)</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos más detalles..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={rating === 0}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar Reseña
          </button>
        </form>
      </div>
    </div>
  );
};