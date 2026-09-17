import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Edit3, Trash2, MapPin, Calendar, Eye } from 'lucide-react';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { memoriesApi } from '../../lib/api';
import toast from 'react-hot-toast';
import type { Memory } from '../../types';

interface MasonryGalleryProps {
  memories: Memory[];
  onMemoryUpdate: (updated: Memory) => void;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
  onView: (index: number) => void;
}

const BREAKPOINTS = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  480: 1,
};

export function MasonryGallery({ memories, onMemoryUpdate, onDelete, onEdit, onView }: MasonryGalleryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFavorite = async (memory: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await memoriesApi.toggleFavorite(memory._id);
      onMemoryUpdate(result.data);
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const handleDelete = async (memory: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${memory.title}"? This cannot be undone.`)) return;
    setDeletingId(memory._id);
    try {
      await memoriesApi.delete(memory._id);
      onDelete(memory._id);
      toast.success('Memory deleted', { style: { background: '#4a0f22', color: '#fdf6f0', borderRadius: '12px' } });
    } catch {
      toast.error('Failed to delete memory');
    } finally {
      setDeletingId(null);
    }
  };

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="text-6xl animate-pulse-soft">📷</div>
        <div className="text-center">
          <p className="font-serif text-2xl font-semibold" style={{ color: '#a0354f' }}>
            No memories yet
          </p>
          <p className="text-sm mt-2" style={{ color: '#c9748a' }}>
            Start adding photos to preserve your best squad memories! 🌟
          </p>
        </div>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={BREAKPOINTS}
      className="masonry-grid"
      columnClassName="masonry-column"
    >
      {memories.map((memory, idx) => (
        <MemoryCard
          key={memory._id}
          memory={memory}
          isDeleting={deletingId === memory._id}
          onView={() => onView(idx)}
          onFavorite={(e) => handleFavorite(memory, e)}
          onEdit={(e) => { e.stopPropagation(); onEdit(memory); }}
          onDelete={(e) => handleDelete(memory, e)}
        />
      ))}
    </Masonry>
  );
}

interface CardProps {
  memory: Memory;
  isDeleting: boolean;
  onView: () => void;
  onFavorite: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function MemoryCard({ memory, isDeleting, onView, onFavorite, onEdit, onDelete }: CardProps) {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="memory-card glass-card rounded-2xl overflow-hidden cursor-pointer group relative"
      style={{ opacity: isDeleting ? 0.5 : 1 }}
      onClick={onView}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(249,228,233,0.8), rgba(245,201,176,0.8))' }} />
        )}
        {inView && (
          <img
            src={memory.thumbnailUrl || memory.imageUrl}
            alt={memory.title}
            onLoad={() => setLoaded(true)}
            className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ display: loaded ? 'block' : 'none', minHeight: 150 }}
          />
        )}

        {/* Overlay */}
        <div className="image-overlay absolute inset-0 flex flex-col justify-between p-3">
          {/* Top actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onFavorite}
              className="p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              title={memory.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={16}
                fill={memory.isFavorite ? '#f9e4e9' : 'none'}
                stroke="#f9e4e9"
              />
            </button>
            <button
              onClick={onEdit}
              className="p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              title="Edit memory"
            >
              <Edit3 size={16} stroke="#f9e4e9" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              title="Delete memory"
            >
              <Trash2 size={16} stroke="#f9e4e9" />
            </button>
          </div>

          {/* Bottom info */}
          <div>
            {memory.caption && (
              <p className="text-white text-sm font-serif italic leading-snug mb-1 line-clamp-2">
                &ldquo;{memory.caption}&rdquo;
              </p>
            )}
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(249,228,233,0.8)' }}>
              {memory.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin size={9} /> {memory.location}
                </span>
              )}
              {memory.date && (
                <span className="flex items-center gap-0.5">
                  <Calendar size={9} />
                  {new Date(memory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Favorite indicator (always visible) */}
        {memory.isFavorite && (
          <div className="absolute top-2 left-2 heartbeat">
            <Heart size={16} fill="#c9748a" stroke="#c9748a" />
          </div>
        )}

        {/* Eye icon on hover center */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="p-3 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
            <Eye size={22} className="text-white" />
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 py-3">
        <h3 className="font-serif font-semibold text-sm leading-tight truncate" style={{ color: '#4a0f22' }}>
          {memory.title}
        </h3>
        {memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {memory.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(201,116,138,0.12)', color: '#c9748a' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
