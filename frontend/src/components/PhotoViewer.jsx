import { X, ChevronLeft, ChevronRight, Heart, Trash2 } from 'lucide-react';

export default function PhotoViewer({ photos, index, onClose, onNext, onPrev, onToggleFavorite, onDelete }) {
  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-30 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
        <X className="w-7 h-7" />
      </button>

      {index > 0 && (
        <button onClick={onPrev} className="absolute left-4 text-white/60 hover:text-white">
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {index < photos.length - 1 && (
        <button onClick={onNext} className="absolute right-4 text-white/60 hover:text-white">
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      <img src={photo.url} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" />

      <div className="absolute bottom-6 flex gap-4 bg-black/50 px-4 py-2 rounded-full">
        <button onClick={() => onToggleFavorite(photo)} className="text-white hover:text-red-400">
          <Heart className={`w-5 h-5 ${photo.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        <button onClick={() => onDelete(photo)} className="text-white hover:text-red-400">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}