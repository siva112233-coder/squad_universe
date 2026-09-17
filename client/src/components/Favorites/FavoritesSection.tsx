import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { memoriesApi } from '../../lib/api';
import toast from 'react-hot-toast';
import type { Memory } from '../../types';

interface FavoritesSectionProps {
  memories: Memory[];
  onView: (index: number, fromFavorites?: boolean) => void;
  onMemoryUpdate: (updated: Memory) => void;
}

export function FavoritesSection({ memories, onView, onMemoryUpdate }: FavoritesSectionProps) {
  const favorites = memories.filter((m) => m.isFavorite);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const handleUnfavorite = async (memory: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await memoriesApi.toggleFavorite(memory._id);
      onMemoryUpdate(result.data);
      toast('⭐ Removed from starred memories', {
        style: { background: '#4a0f22', color: '#fdf6f0', borderRadius: '12px' },
      });
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <section ref={ref} className="py-20 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="section-eyebrow text-2xl">Most Cherished</span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold gradient-text-rose mt-2 flex items-center justify-center gap-3">
          Starred Squad Moments
          <span className="inline-block">⭐</span>
        </h2>
        {favorites.length > 0 && (
          <p className="mt-4" style={{ color: '#c9748a' }}>
            {favorites.length} precious squad moment{favorites.length > 1 ? 's' : ''} saved
          </p>
        )}
      </div>

      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center py-16"
        >
          <div className="text-5xl mb-4">⭐</div>
          <p className="font-serif text-xl" style={{ color: '#c9748a' }}>
            No starred memories yet
          </p>
          <p className="text-sm mt-2" style={{ color: '#a0354f', opacity: 0.7 }}>
            Tap the star on any memory to save it here
          </p>
        </motion.div>
      ) : (
        /* Horizontal scroll ribbon */
        <div className="overflow-x-auto pb-4 -mx-6 px-6">
          <div className="flex gap-5 w-max">
            {favorites.map((memory, idx) => {
              const originalIdx = memories.findIndex((m) => m._id === memory._id);
              return (
                <motion.div
                  key={memory._id}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="flex-shrink-0 w-64 glass-card rounded-2xl overflow-hidden cursor-pointer group shadow-card memory-card"
                  onClick={() => onView(originalIdx)}
                >
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={memory.thumbnailUrl || memory.imageUrl}
                      alt={memory.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(74,15,34,0.8), transparent 60%)' }} />

                    {/* Heart badge */}
                    <div className="absolute top-3 left-3 heartbeat">
                      <div className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                        <Heart size={16} fill="#c9748a" stroke="#c9748a" />
                      </div>
                    </div>

                    {/* Unfavorite button */}
                    <button
                      onClick={(e) => handleUnfavorite(memory, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      style={{ background: 'rgba(74,15,34,0.7)' }}
                      title="Remove from favorites"
                    >
                      <Heart size={13} fill="white" stroke="white" />
                    </button>

                    {/* Caption */}
                    {memory.caption && (
                      <p className="absolute bottom-3 left-3 right-3 text-xs font-serif italic text-white leading-snug line-clamp-2">
                        &ldquo;{memory.caption}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="px-4 py-3">
                    <h3 className="font-serif font-semibold text-sm truncate" style={{ color: '#4a0f22' }}>
                      {memory.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: '#c9748a' }}>
                      {new Date(memory.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
