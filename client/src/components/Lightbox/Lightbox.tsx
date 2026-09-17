import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Edit, Download, MapPin, Calendar, ZoomIn } from 'lucide-react';
import type { Memory } from '../../types';
import { memoriesApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface LightboxProps {
  memories: Memory[];
  initialIndex: number;
  onClose: () => void;
  onEdit: (memory: Memory) => void;
  onMemoryUpdate: (updated: Memory) => void;
}

export function Lightbox({ memories, initialIndex, onClose, onEdit, onMemoryUpdate }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const memory = memories[index];

  const navigate = useCallback((dir: number) => {
    setDirection(dir);
    setZoomed(false);
    setIndex((i) => {
      const next = i + dir;
      if (next < 0) return memories.length - 1;
      if (next >= memories.length) return 0;
      return next;
    });
  }, [memories.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      else if (e.key === 'ArrowRight') navigate(1);
      else if (e.key === 'Escape') onClose();
      else if (e.key === 'f' || e.key === 'F') handleFavorite();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const handleFavorite = async () => {
    try {
      const result = await memoriesApi.toggleFavorite(memory._id);
      onMemoryUpdate(result.data);
      toast(result.data.isFavorite ? '❤️ Added to favorites!' : '💔 Removed from favorites', {
        style: { background: '#4a0f22', color: '#fdf6f0', borderRadius: '12px' },
      });
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = memory.imageUrl;
    a.download = `${memory.title}.jpg`;
    a.target = '_blank';
    a.click();
  };

  if (!memory) return null;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: 'rgba(10, 2, 6, 0.97)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: 'linear-gradient(to bottom, rgba(10,2,6,0.9), transparent)' }}>
          <div className="flex items-center gap-3">
            <span className="font-serif text-white text-lg font-semibold">{memory.title}</span>
            <span className="text-sm" style={{ color: 'rgba(232,180,190,0.6)' }}>
              {index + 1} / {memories.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleFavorite} className="p-2 rounded-full transition-all duration-300 hover:bg-white/10">
              <Heart
                size={20}
                fill={memory.isFavorite ? '#c9748a' : 'none'}
                stroke={memory.isFavorite ? '#c9748a' : '#e8b4be'}
                className={memory.isFavorite ? 'heartbeat' : ''}
              />
            </button>
            <button onClick={() => onEdit(memory)} className="p-2 rounded-full transition-all duration-300 hover:bg-white/10">
              <Edit size={20} style={{ color: '#e8b4be' }} />
            </button>
            <button onClick={handleDownload} className="p-2 rounded-full transition-all duration-300 hover:bg-white/10">
              <Download size={20} style={{ color: '#e8b4be' }} />
            </button>
            <button onClick={onClose} className="p-2 rounded-full transition-all duration-300 hover:bg-white/10">
              <X size={22} style={{ color: '#e8b4be' }} />
            </button>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
        >
          <ChevronRight size={20} className="text-white" />
        </button>

        {/* Main image */}
        <div className="flex-1 flex items-center justify-center px-12 md:px-20 pt-14 md:pt-16 pb-28 md:pb-32">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={memory._id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative max-w-full max-h-full flex items-center justify-center cursor-zoom-in"
              onClick={() => setZoomed(!zoomed)}
            >
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="max-h-[55vh] md:max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-500"
                style={{
                  transform: zoomed ? 'scale(1.5)' : 'scale(1)',
                  boxShadow: '0 0 80px rgba(160, 53, 79, 0.15)',
                }}
              />
              {!zoomed && (
                <div className="absolute bottom-2 right-2 p-1 rounded opacity-50">
                  <ZoomIn size={16} className="text-white" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 px-8 py-6"
          style={{ background: 'linear-gradient(to top, rgba(10,2,6,0.95), transparent)' }}>
          <div className="max-w-2xl mx-auto text-center">
            {memory.caption && (
              <p className="font-serif italic text-lg text-white mb-2">&ldquo;{memory.caption}&rdquo;</p>
            )}
            {memory.description && (
              <p className="text-sm mb-3" style={{ color: 'rgba(232,180,190,0.8)' }}>{memory.description}</p>
            )}
            <div className="flex items-center justify-center gap-6 text-sm" style={{ color: 'rgba(232,180,190,0.6)' }}>
              {memory.date && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(memory.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {memory.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {memory.location}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="hidden md:flex justify-center gap-2 mt-4 overflow-x-auto pb-1">
            {memories.slice(Math.max(0, index - 3), index + 4).map((m, i) => {
              const actualIdx = Math.max(0, index - 3) + i;
              return (
                <button
                  key={m._id}
                  onClick={() => { setDirection(actualIdx > index ? 1 : -1); setIndex(actualIdx); }}
                  className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-200"
                  style={{
                    border: actualIdx === index ? '2px solid #c9748a' : '2px solid transparent',
                    opacity: actualIdx === index ? 1 : 0.5,
                  }}
                >
                  <img src={m.thumbnailUrl || m.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="absolute bottom-4 right-8 hidden md:flex gap-3 opacity-30">
          {['←', '→', 'Esc', 'F'].map((key, i) => (
            <kbd key={i} className="px-2 py-1 rounded text-xs border text-white" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
              {key}
            </kbd>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
