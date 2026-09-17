import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

const CORRECT_PIN = '1122';
const SESSION_KEY = 'olu_unlocked';

interface PinLockProps {
  onUnlock: () => void;
}

export function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => verify(next), 150);
    }
  };

  const verify = (p: string) => {
    if (p === CORRECT_PIN) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onUnlock();
    } else {
      setShaking(true);
      setError(true);
      setTimeout(() => { setPin(''); setShaking(false); }, 600);
    }
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
    else if (e.key === 'Backspace') handleBackspace();
    else if (e.key === 'Enter' && pin.length === 4) verify(pin);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #fdf6f0 0%, #fdf0f5 40%, #f9e4e9 100%)' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #c9748a, transparent)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f5c9b0, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-card rounded-3xl p-10 w-full max-w-sm mx-4 text-center shadow-rose-glow-lg"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-soft"
          style={{ background: 'linear-gradient(135deg, rgba(160,53,79,0.15), rgba(201,116,138,0.25))' }}>
          <Lock size={32} style={{ color: '#a0354f' }} />
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-bold gradient-text-rose mb-2">
          Our Squad Universe
        </h1>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles size={14} style={{ color: '#c9748a' }} />
          <p className="font-script text-lg" style={{ color: '#c9748a' }}>
            A private memory vault for best friends
          </p>
          <Sparkles size={14} style={{ color: '#c9748a' }} />
        </div>

        <p className="text-sm mb-8" style={{ color: '#a0354f', opacity: 0.8 }}>
          Enter your 4-digit PIN to enter
        </p>

        {/* PIN dots */}
        <motion.div
          className="flex justify-center gap-4 mb-6"
          animate={shaking ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: i < pin.length ? 1.2 : 1,
                background: error
                  ? '#ef4444'
                  : i < pin.length
                  ? '#a0354f'
                  : 'rgba(201,116,138,0.2)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-4 h-4 rounded-full"
            />
          ))}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mb-4"
          >
            Incorrect PIN. Try again ⚡
          </motion.p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {['1','2','3','4','5','6','7','8','9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-14 rounded-2xl font-semibold text-xl transition-all duration-200 active:scale-95"
              style={{
                background: 'rgba(160,53,79,0.08)',
                color: '#4a0f22',
                border: '1.5px solid rgba(201,116,138,0.2)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(160,53,79,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(160,53,79,0.08)')}
            >
              {d}
            </button>
          ))}
          <div /> {/* Empty */}
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl font-semibold text-xl transition-all duration-200 active:scale-95"
            style={{
              background: 'rgba(160,53,79,0.08)',
              color: '#4a0f22',
              border: '1.5px solid rgba(201,116,138,0.2)',
            }}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-95"
            style={{
              background: 'rgba(160,53,79,0.08)',
              color: '#a0354f',
              border: '1.5px solid rgba(201,116,138,0.2)',
            }}
          >
            ⌫
          </button>
        </div>

        <p className="text-xs mt-4" style={{ color: 'rgba(160,53,79,0.4)' }}>
          Made with 💛 for awesome friends
        </p>
      </motion.div>
    </div>
  );
}

export function checkUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}
