import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Plus, Camera, Heart, Clock, ChevronUp, Search, X, Sparkles } from 'lucide-react';

import { FloatingHearts } from './components/ui/FloatingHearts';
import { HeroSection } from './components/Hero/HeroSection';
import { MasonryGallery } from './components/Gallery/MasonryGallery';
import { UploadModal } from './components/UploadModal/UploadModal';
import { Lightbox } from './components/Lightbox/Lightbox';
import { ImageEditor } from './components/Editor/ImageEditor';
import { TimelineSection } from './components/Timeline/TimelineSection';
import { FavoritesSection } from './components/Favorites/FavoritesSection';
import { MusicPlayer } from './components/MusicPlayer/MusicPlayer';
import { PinLock, checkUnlocked } from './components/PinLock/PinLock';

import { memoriesApi } from './lib/api';
import type { Memory, Stats } from './types';

type Section = 'gallery' | 'favorites' | 'timeline';

function App() {
  const [unlocked, setUnlocked] = useState(() => checkUnlocked());
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('gallery');
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const galleryRef = useRef<HTMLDivElement | null>(null);
  const favoritesRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Fetch data
  const fetchMemories = useCallback(async () => {
    try {
      const [memRes, statsRes] = await Promise.all([
        memoriesApi.getAll({ sort: sortBy }),
        memoriesApi.getStats(),
      ]);
      setMemories(memRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (unlocked) fetchMemories();
  }, [unlocked, fetchMemories]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Filtered memories for search
  const filteredMemories = memories.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.caption.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleMemoryUpdate = (updated: Memory) => {
    setMemories((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
    // Refresh stats
    memoriesApi.getStats().then((r) => setStats(r.data));
  };

  const handleDelete = (id: string) => {
    setMemories((prev) => prev.filter((m) => m._id !== id));
    memoriesApi.getStats().then((r) => setStats(r.data));
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen relative">
      <Toaster position="top-center" />
      <FloatingHearts />

      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4"
        style={{ background: 'rgba(253,246,240,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(201,116,138,0.15)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-dusty-pink animate-pulse" style={{ color: '#c9748a' }} />
            <span className="font-serif text-lg font-bold gradient-text-rose">Our Squad Universe</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { id: 'gallery' as Section, label: 'Gallery', icon: <Camera size={15} />, ref: galleryRef },
              { id: 'favorites' as Section, label: 'Favourites', icon: <Heart size={15} />, ref: favoritesRef },
              { id: 'timeline' as Section, label: 'Timeline', icon: <Clock size={15} />, ref: timelineRef },
            ].map(({ id, label, icon, ref }) => (
              <button
                key={id}
                onClick={() => { setActiveSection(id); scrollTo(ref); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSection === id ? 'btn-rose' : 'btn-ghost-rose'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowUpload(true)}
            className="btn-rose flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={16} /> Add Memory
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="pt-16">
        <HeroSection
          stats={stats}
          onExplore={() => { setActiveSection('gallery'); scrollTo(galleryRef); }}
          onAddMemory={() => setShowUpload(true)}
        />
      </div>

      {/* Gallery Section */}
      <section ref={galleryRef} className="py-20 px-6 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="section-eyebrow text-2xl">Memory Lane</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold gradient-text-rose mt-2">
            Our Photo Gallery
          </h2>
          <p className="mt-4" style={{ color: '#c9748a' }}>
            Every photo tells a piece of our story
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#c9748a' }} />
            <input
              className="romantic-input pl-10"
              placeholder="Search memories by title, caption, location, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#c9748a' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            className="romantic-input w-auto px-4 py-3 cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-dusty-pink animate-spin"
              style={{ borderTopColor: '#c9748a', borderColor: 'rgba(232,180,190,0.3)' }} />
            <p className="font-script text-xl" style={{ color: '#c9748a' }}>Loading your memories...</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <p className="text-sm mb-4" style={{ color: '#c9748a' }}>
                Found {filteredMemories.length} result{filteredMemories.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
            <MasonryGallery
              memories={filteredMemories}
              onMemoryUpdate={handleMemoryUpdate}
              onDelete={handleDelete}
              onEdit={setEditingMemory}
              onView={(idx) => {
                // Map back to full memories array index
                const memId = filteredMemories[idx]?._id;
                const realIdx = memories.findIndex((m) => m._id === memId);
                setLightboxIndex(realIdx >= 0 ? realIdx : idx);
              }}
            />
          </>
        )}
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,116,138,0.4), transparent)' }} />
      </div>

      {/* Favorites Section */}
      <div ref={favoritesRef}>
        <FavoritesSection
          memories={memories}
          onView={(idx) => setLightboxIndex(idx)}
          onMemoryUpdate={handleMemoryUpdate}
        />
      </div>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,116,138,0.4), transparent)' }} />
      </div>

      {/* Timeline Section */}
      <div ref={timelineRef}>
        <TimelineSection
          memories={memories}
          onView={(idx) => setLightboxIndex(idx)}
        />
      </div>

      {/* Footer */}
      <footer className="text-center py-12 px-6" style={{ borderTop: '1px solid rgba(201,116,138,0.15)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles size={16} style={{ color: '#c9748a' }} />
          <span className="font-script text-xl gradient-text-rose">Our Squad Universe</span>
          <Sparkles size={16} style={{ color: '#c9748a' }} />
        </div>
        <p className="text-sm" style={{ color: 'rgba(160,53,79,0.6)' }}>
          A private digital space for our best squad memories 🌟
        </p>
        <p className="text-xs mt-2" style={{ color: 'rgba(160,53,79,0.4)' }}>
          {stats.total} memories &bull; {stats.favorites} starred
        </p>
      </footer>

      {/* Floating Add Button (mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full btn-rose flex items-center justify-center md:hidden shadow-rose-glow-lg"
      >
        <Plus size={24} />
      </motion.button>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 left-6 z-40 w-10 h-10 rounded-full flex items-center justify-center glass shadow-card"
            style={{ color: '#a0354f' }}
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Music Player */}
      <MusicPlayer />

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={() => {
              fetchMemories();
              setShowUpload(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            memories={memories}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onEdit={(m) => { setLightboxIndex(null); setEditingMemory(m); }}
            onMemoryUpdate={handleMemoryUpdate}
          />
        )}
      </AnimatePresence>

      {/* Image Editor */}
      <AnimatePresence>
        {editingMemory && (
          <ImageEditor
            memory={editingMemory}
            onClose={() => setEditingMemory(null)}
            onSave={(updated) => {
              handleMemoryUpdate(updated);
              setEditingMemory(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
