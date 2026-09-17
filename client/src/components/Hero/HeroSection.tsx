import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, Sparkles } from 'lucide-react';
import type { Stats } from '../../types';

interface HeroSectionProps {
  stats: Stats;
  onExplore: () => void;
  onAddMemory: () => void;
}

const words = ['Our Squad Universe', 'Every Picture Has a Story', 'Unforgettable Friendship', 'Our Memories In Photos'];

export function HeroSection({ stats, onExplore, onAddMemory }: HeroSectionProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    const current = words[wordIndex];
    if (typing) {
      if (charIndex < current.length) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex(c => c + 1);
        }, 80);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 2500);
        return () => clearTimeout(t);
      }
    } else {
      if (charIndex > 0) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex - 1));
          setCharIndex(c => c - 1);
        }, 40);
        return () => clearTimeout(t);
      } else {
        setWordIndex(i => (i + 1) % words.length);
        setTyping(true);
      }
    }
  }, [charIndex, typing, wordIndex]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #c9748a, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f5c9b0, transparent)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #a0354f, transparent)' }} />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="section-eyebrow text-2xl"
        >
          ✨ A private space for our best friends & memories ✨
        </motion.span>

        {/* Main heading - typewriter */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight min-h-[4rem] md:min-h-[6rem]"
          style={{ color: '#4a0f22', textShadow: '0 2px 20px rgba(160, 53, 79, 0.15)' }}
        >
          {displayed}
          <span
            className="inline-block w-0.5 h-10 md:h-20 ml-1 align-middle rounded animate-pulse"
            style={{ background: '#c9748a', verticalAlign: 'bottom' }}
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-serif italic text-base md:text-2xl mb-2 px-4"
          style={{ color: '#a0354f' }}
        >
          "Because true friendship isn't about being inseparable —
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="font-serif italic text-base md:text-2xl mb-8 px-4"
          style={{ color: '#c9748a' }}
        >
          they just keep collecting unforgettable moments together." 🌟
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button
            onClick={onExplore}
            className="btn-rose flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-2xl font-semibold text-base md:text-lg transition-all duration-300 w-full sm:w-auto"
          >
            <Camera size={18} />
            Explore Memories
          </button>
          <button
            onClick={onAddMemory}
            className="btn-ghost-rose flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-2xl font-semibold text-base md:text-lg w-full sm:w-auto"
          >
            <Plus size={18} />
            Add a Memory
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="glass rounded-3xl px-4 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 shadow-card mx-auto max-w-2xl"
        >
          <StatItem
            icon={<Camera size={22} />}
            value={stats.total}
            label="Total Memories"
          />
          <div className="hidden sm:block w-px h-10 opacity-30" style={{ background: '#c9748a' }} />
          <StatItem
            icon={<Sparkles size={22} fill="currentColor" />}
            value={stats.favorites}
            label="Starred Moments ⭐"
          />
          <div className="hidden sm:block w-px h-10 opacity-30" style={{ background: '#c9748a' }} />
          <StatItem
            icon={<Sparkles size={22} />}
            value={stats.total > 0 ? Math.ceil(stats.total / 12) : 0}
            label="Chapters of Friendship"
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: '#c9748a' }}
      >
        <span className="text-sm font-script">scroll down</span>
        <div className="w-px h-12 animate-bounce-soft mx-auto"
          style={{ background: 'linear-gradient(to bottom, #c9748a, transparent)' }} />
      </motion.div>
    </section>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ color: '#c9748a' }}>{icon}</div>
      <span className="font-serif text-3xl font-bold" style={{ color: '#4a0f22' }}>
        {value.toLocaleString()}
      </span>
      <span className="text-sm" style={{ color: '#a0354f', opacity: 0.8 }}>{label}</span>
    </div>
  );
}
