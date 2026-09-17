import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Calendar } from 'lucide-react';
import type { Memory } from '../../types';

interface TimelineSectionProps {
  memories: Memory[];
  onView: (index: number) => void;
}

export function TimelineSection({ memories, onView }: TimelineSectionProps) {
  const sorted = [...memories].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length === 0) return null;

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-16">
        <span className="section-eyebrow text-2xl">Our Friendship Journey</span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold gradient-text-rose mt-2">
          A Timeline of Us 🌟
        </h2>
        <p className="mt-4 text-lg" style={{ color: '#c9748a' }}>
          Every chapter filled with laughs and adventures
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 timeline-line hidden md:block" />

        {sorted.map((memory, idx) => (
          <TimelineItem
            key={memory._id}
            memory={memory}
            idx={idx}
            isLeft={idx % 2 === 0}
            onClick={() => {
              const originalIdx = memories.findIndex((m) => m._id === memory._id);
              onView(originalIdx);
            }}
          />
        ))}
      </div>
    </section>
  );
}

interface ItemProps {
  memory: Memory;
  idx: number;
  isLeft: boolean;
  onClick: () => void;
}

function TimelineItem({ memory, idx, isLeft, onClick }: ItemProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`relative flex items-center mb-12 md:mb-16 ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      } flex-col`}
    >
      {/* Center dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full z-10 hidden md:block"
        style={{
          background: 'linear-gradient(135deg, #c9748a, #a0354f)',
          boxShadow: '0 0 12px rgba(201,116,138,0.6)',
        }}
      />

      {/* Date badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className={`absolute left-1/2 -translate-x-1/2 -top-7 hidden md:block`}
      >
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #a0354f, #c9748a)', color: 'white' }}
        >
          {new Date(memory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onClick={onClick}
        className={`glass-card rounded-2xl overflow-hidden cursor-pointer group shadow-card hover:shadow-card-hover transition-shadow duration-300 w-full md:w-[45%] ${
          isLeft ? 'md:mr-auto' : 'md:ml-auto'
        }`}
      >
        {/* Image */}
        {memory.thumbnailUrl || memory.imageUrl ? (
          <div className="relative overflow-hidden h-48">
            <img
              src={memory.thumbnailUrl || memory.imageUrl}
              alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(74,15,34,0.5), transparent)' }} />
          </div>
        ) : null}

        <div className="p-5">
          {/* Mobile date */}
          <div className="md:hidden mb-2">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(160,53,79,0.15)', color: '#a0354f' }}
            >
              {new Date(memory.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold mb-1" style={{ color: '#4a0f22' }}>
            {memory.title}
          </h3>

          {memory.caption && (
            <p className="font-serif italic text-sm mb-2" style={{ color: '#a0354f' }}>
              &ldquo;{memory.caption}&rdquo;
            </p>
          )}

          {memory.description && (
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#6b2d42' }}>
              {memory.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#c9748a' }}>
            {memory.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {memory.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(memory.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Chapter number */}
        <div
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'rgba(255,255,255,0.9)', color: '#a0354f' }}
        >
          {idx + 1}
        </div>
      </motion.div>
    </div>
  );
}
