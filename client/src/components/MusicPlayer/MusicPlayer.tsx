import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

// 🎵 To change the song:
// 1. Copy your MP3 into: client/public/  (e.g. client/public/song.mp3)
// 2. Change TRACK_URL below to '/song.mp3'
// 3. Update TRACK_NAME to your song name
const TRACK_URL = '/song.mp3';          // ← change filename here
const TRACK_NAME = 'Our Song ♪';        // ← change song name here

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.loop = true;
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        console.warn('Audio play failed — user interaction required');
      }
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <div className="music-player">
      <audio ref={audioRef} src={TRACK_URL} preload="metadata" />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-dark rounded-2xl overflow-hidden shadow-rose-glow-lg"
          style={{ minWidth: isExpanded ? 240 : 'auto' }}
        >
          {/* Collapsed view */}
          <div className="flex items-center gap-3 p-3">
            {/* Animated music icon */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #a0354f, #c9748a)' }}
            >
              {isPlaying ? (
                <Pause size={16} className="text-white" />
              ) : (
                <Play size={16} className="text-white ml-0.5" />
              )}
            </button>

            {/* Visualizer bars — only when playing */}
            <div className="flex items-center gap-0.5 h-8">
              {isPlaying ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full"
                    style={{
                      background: 'linear-gradient(to top, #a0354f, #e8b4be)',
                      animation: `bounce ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
                      height: `${Math.random() * 20 + 8}px`,
                    }}
                  />
                ))
              ) : (
                <Music size={16} style={{ color: '#e8b4be' }} />
              )}
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                className="flex items-center gap-2"
              >
                <button onClick={toggleMute} className="text-rose-300 hover:text-white transition-colors">
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-20"
                  style={{ background: `linear-gradient(to right, #c9748a ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)` }}
                />
              </motion.div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-rose-200 hover:text-white transition-colors ml-auto"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 pb-3"
            >
              <p className="text-xs text-rose-200 font-script text-center">{TRACK_NAME}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        @keyframes bounce {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
