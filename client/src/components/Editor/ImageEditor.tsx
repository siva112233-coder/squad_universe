import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Sun, Contrast, Droplets, Eye, Thermometer,
  Wind, Sparkles, RotateCcw as Reset, Save, Loader2, SlidersHorizontal, Layers
} from 'lucide-react';
import { memoriesApi } from '../../lib/api';
import toast from 'react-hot-toast';
import type { Memory, ImageAdjustments, EditorState, FilterPreset } from '../../types';

interface ImageEditorProps {
  memory: Memory;
  onClose: () => void;
  onSave: (updated: Memory) => void;
}

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100, contrast: 100, saturation: 100,
  exposure: 0, warmth: 0, blur: 0, sharpness: 0,
};

const DEFAULT_STATE: EditorState = {
  rotation: 0, flipH: false, flipV: false, zoom: 1,
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  filter: 'none',
};

const FILTERS: { id: FilterPreset; label: string; style: string }[] = [
  { id: 'none', label: 'Original', style: '' },
  { id: 'romantic', label: 'Romantic', style: 'sepia(0.3) saturate(1.4) hue-rotate(-10deg) brightness(1.05)' },
  { id: 'vintage', label: 'Vintage', style: 'sepia(0.5) contrast(0.85) brightness(0.95) saturate(0.9)' },
  { id: 'dreamy', label: 'Dreamy', style: 'brightness(1.1) saturate(1.2) contrast(0.9) hue-rotate(5deg)' },
  { id: 'warm', label: 'Warm', style: 'sepia(0.2) saturate(1.3) brightness(1.08) hue-rotate(-5deg)' },
  { id: 'cinematic', label: 'Cinematic', style: 'contrast(1.15) saturate(0.85) brightness(0.95)' },
  { id: 'bw', label: 'B & W', style: 'grayscale(1) contrast(1.1)' },
];

function buildCssFilter(adj: ImageAdjustments, filter: FilterPreset): string {
  const preset = FILTERS.find((f) => f.id === filter)?.style || '';
  const base = `brightness(${adj.brightness / 100}) contrast(${adj.contrast / 100}) saturate(${adj.saturation / 100}) blur(${adj.blur}px)`;
  const exposure = adj.exposure !== 0 ? ` brightness(${1 + adj.exposure / 200})` : '';
  const warmth = adj.warmth !== 0 ? ` hue-rotate(${adj.warmth * 0.2}deg) saturate(${1 + adj.warmth / 200})` : '';
  return `${base}${exposure}${warmth} ${preset}`;
}

function buildTransform(state: EditorState): string {
  return `rotate(${state.rotation}deg) scaleX(${state.flipH ? -1 : 1}) scaleY(${state.flipV ? -1 : 1}) scale(${state.zoom})`;
}

type MobileTab = 'filters' | 'adjust' | 'transform';

export function ImageEditor({ memory, onClose, onSave }: ImageEditorProps) {
  const [state, setState] = useState<EditorState>({ ...DEFAULT_STATE });
  const [saving, setSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('filters');
  const imgRef = useRef<HTMLImageElement>(null);

  const update = (patch: Partial<EditorState>) => setState((s) => ({ ...s, ...patch }));
  const updateAdj = (patch: Partial<ImageAdjustments>) =>
    setState((s) => ({ ...s, adjustments: { ...s.adjustments, ...patch } }));

  const reset = () => setState({ ...DEFAULT_STATE });

  const handleSave = async () => {
    setSaving(true);
    try {
      const img = imgRef.current;
      if (!img) throw new Error('Image not loaded');
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((state.rotation * Math.PI) / 180);
      ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);
      ctx.filter = buildCssFilter(state.adjustments, state.filter);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();
      const base64 = canvas.toDataURL('image/jpeg', 0.92);
      const result = await memoriesApi.saveEditedImage(memory._id, base64);
      toast.success('✨ Image saved!', { style: { background: '#4a0f22', color: '#fdf6f0', borderRadius: '12px' } });
      onSave(result.data);
      onClose();
    } catch {
      toast.error('Failed to save edited image');
    } finally {
      setSaving(false);
    }
  };

  const cssFilter = buildCssFilter(state.adjustments, state.filter);
  const transform = buildTransform(state);

  const Slider = ({
    icon, label, value, min, max, step, onChange,
  }: {
    icon: React.ReactNode; label: string; value: number;
    min: number; max: number; step: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs" style={{ color: '#c9748a' }}>
          {icon} {label}
        </span>
        <span className="text-xs font-mono" style={{ color: '#a0354f' }}>{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{ background: `linear-gradient(to right, #c9748a ${((value - min) / (max - min)) * 100}%, rgba(201,116,138,0.2) ${((value - min) / (max - min)) * 100}%)` }}
      />
    </div>
  );

  const ControlsPanel = () => (
    <div className="flex flex-col gap-4 p-4">
      {/* Transform */}
      {(mobileTab === 'transform' || typeof window !== 'undefined' && window.innerWidth >= 768) && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#e8b4be' }}>Transform</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <RotateCcw size={15} />, label: 'CCW', action: () => update({ rotation: state.rotation - 90 }) },
              { icon: <RotateCw size={15} />, label: 'CW', action: () => update({ rotation: state.rotation + 90 }) },
              { icon: <FlipHorizontal size={15} />, label: 'Flip H', action: () => update({ flipH: !state.flipH }) },
              { icon: <FlipVertical size={15} />, label: 'Flip V', action: () => update({ flipV: !state.flipV }) },
              { icon: <ZoomIn size={15} />, label: 'Zoom +', action: () => update({ zoom: Math.min(state.zoom + 0.1, 3) }) },
              { icon: <ZoomOut size={15} />, label: 'Zoom -', action: () => update({ zoom: Math.max(state.zoom - 0.1, 0.5) }) },
            ].map(({ icon, label, action }) => (
              <button key={label} onClick={action}
                className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all duration-200 hover:bg-rose-900"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#e8b4be' }}>
                {icon}<span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {(mobileTab === 'filters' || typeof window !== 'undefined' && window.innerWidth >= 768) && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#e8b4be' }}>Filter Presets</h4>
          <div className="grid grid-cols-4 md:grid-cols-3 gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => update({ filter: f.id })}
                className="flex flex-col items-center gap-1 rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  border: state.filter === f.id ? '2px solid #c9748a' : '2px solid transparent',
                  boxShadow: state.filter === f.id ? '0 0 12px rgba(201,116,138,0.4)' : 'none',
                }}>
                <div className="w-full aspect-square overflow-hidden rounded-lg">
                  <img src={memory.thumbnailUrl || memory.imageUrl} alt={f.label}
                    className="w-full h-full object-cover"
                    style={{ filter: f.style || 'none' }} />
                </div>
                <span className="text-xs pb-1" style={{ color: state.filter === f.id ? '#e8b4be' : '#a0354f' }}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Adjustments */}
      {(mobileTab === 'adjust' || typeof window !== 'undefined' && window.innerWidth >= 768) && (
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#e8b4be' }}>Adjustments</h4>
          <Slider icon={<Sun size={12} />} label="Brightness" value={state.adjustments.brightness} min={0} max={200} step={1} onChange={(v) => updateAdj({ brightness: v })} />
          <Slider icon={<Contrast size={12} />} label="Contrast" value={state.adjustments.contrast} min={0} max={200} step={1} onChange={(v) => updateAdj({ contrast: v })} />
          <Slider icon={<Droplets size={12} />} label="Saturation" value={state.adjustments.saturation} min={0} max={200} step={1} onChange={(v) => updateAdj({ saturation: v })} />
          <Slider icon={<Eye size={12} />} label="Exposure" value={state.adjustments.exposure} min={-100} max={100} step={1} onChange={(v) => updateAdj({ exposure: v })} />
          <Slider icon={<Thermometer size={12} />} label="Warmth" value={state.adjustments.warmth} min={-100} max={100} step={1} onChange={(v) => updateAdj({ warmth: v })} />
          <Slider icon={<Wind size={12} />} label="Blur" value={state.adjustments.blur} min={0} max={10} step={0.1} onChange={(v) => updateAdj({ blur: v })} />
          <Slider icon={<Sparkles size={12} />} label="Sharpness" value={state.adjustments.sharpness} min={0} max={10} step={0.1} onChange={(v) => updateAdj({ sharpness: v })} />
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex flex-col"
        style={{ background: 'rgba(20, 5, 12, 0.97)' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 z-10 flex items-center justify-between px-3 md:px-6 py-3 md:py-4"
          style={{ background: 'rgba(74, 15, 34, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(232,180,190,0.1)' }}>
          <div>
            <h3 className="font-serif text-base md:text-xl font-bold text-white">Edit Memory</h3>
            <p className="text-xs hidden sm:block" style={{ color: '#e8b4be' }}>{memory.title}</p>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            <button onClick={reset}
              className="flex items-center gap-1 px-2 md:px-4 py-2 rounded-xl text-xs md:text-sm btn-ghost-rose"
              style={{ color: '#e8b4be', borderColor: 'rgba(232,180,190,0.4)' }}>
              <Reset size={13} /> <span className="hidden sm:inline">Reset</span>
            </button>
            <button onClick={onClose}
              className="flex items-center gap-1 px-2 md:px-4 py-2 rounded-xl text-xs md:text-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#e8b4be' }}>
              <X size={13} /> <span className="hidden sm:inline">Cancel</span>
            </button>
            <button onClick={handleSave} disabled={saving}
              className="btn-rose flex items-center gap-1 px-3 md:px-6 py-2 rounded-xl text-xs md:text-sm font-semibold">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* DESKTOP layout: side-by-side */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Image preview */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <img ref={imgRef} src={memory.imageUrl} alt={memory.title} crossOrigin="anonymous"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              style={{ filter: cssFilter, transform, transition: 'filter 0.2s, transform 0.3s' }} />
          </div>
          {/* Controls panel */}
          <div className="w-80 flex-shrink-0 overflow-y-auto"
            style={{ background: 'rgba(74, 15, 34, 0.6)', backdropFilter: 'blur(10px)', borderLeft: '1px solid rgba(232,180,190,0.15)' }}>
            <ControlsPanel />
          </div>
        </div>

        {/* MOBILE layout: image on top, tabs + panel below */}
        <div className="flex md:hidden flex-col flex-1 overflow-hidden">
          {/* Image */}
          <div className="flex items-center justify-center p-4 flex-shrink-0" style={{ height: '40vh' }}>
            <img ref={imgRef} src={memory.imageUrl} alt={memory.title} crossOrigin="anonymous"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              style={{ filter: cssFilter, transform, transition: 'filter 0.2s, transform 0.3s' }} />
          </div>

          {/* Mobile tab bar */}
          <div className="flex-shrink-0 flex border-t" style={{ borderColor: 'rgba(232,180,190,0.15)', background: 'rgba(74,15,34,0.8)' }}>
            {([
              { id: 'filters' as MobileTab, icon: <Layers size={16} />, label: 'Filters' },
              { id: 'adjust' as MobileTab, icon: <SlidersHorizontal size={16} />, label: 'Adjust' },
              { id: 'transform' as MobileTab, icon: <RotateCw size={16} />, label: 'Transform' },
            ] as { id: MobileTab; icon: React.ReactNode; label: string }[]).map(({ id, icon, label }) => (
              <button key={id} onClick={() => setMobileTab(id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-200"
                style={{
                  color: mobileTab === id ? '#e8b4be' : 'rgba(232,180,190,0.4)',
                  borderBottom: mobileTab === id ? '2px solid #c9748a' : '2px solid transparent',
                }}>
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Mobile controls */}
          <div className="flex-1 overflow-y-auto"
            style={{ background: 'rgba(74, 15, 34, 0.6)' }}>
            <ControlsPanel />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
