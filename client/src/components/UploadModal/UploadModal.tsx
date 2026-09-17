import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image, Calendar, MapPin, Tag, Loader2, Plus } from 'lucide-react';
import { memoriesApi } from '../../lib/api';
import toast from 'react-hot-toast';
import type { UploadFormData } from '../../types';

interface FilePreview {
  file: File;
  preview: string;
  formData: UploadFormData;
}

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const defaultForm = (): UploadFormData => ({
  title: '',
  caption: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  location: '',
  tags: [],
});

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, 'pending' | 'done' | 'error'>>({});
  const [tagInput, setTagInput] = useState('');

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      formData: { ...defaultForm(), title: file.name.replace(/\.[^.]+$/, '') },
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const updateField = (idx: number, field: keyof UploadFormData, value: string | string[]) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, formData: { ...f.formData, [field]: value } } : f))
    );
  };

  const addTag = (idx: number) => {
    if (!tagInput.trim()) return;
    const tags = files[idx].formData.tags;
    if (!tags.includes(tagInput.trim())) {
      updateField(idx, 'tags', [...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const removeTag = (fileIdx: number, tag: string) => {
    updateField(fileIdx, 'tags', files[fileIdx].formData.tags.filter((t) => t !== tag));
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(files[idx].preview);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    if (selected >= idx && selected > 0) setSelected(selected - 1);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      setUploadProgress((p) => ({ ...p, [i]: 'pending' }));
      try {
        const fd = new FormData();
        fd.append('image', files[i].file);
        const { formData } = files[i];
        fd.append('title', formData.title || 'Untitled Memory');
        fd.append('caption', formData.caption);
        fd.append('description', formData.description);
        fd.append('date', formData.date);
        fd.append('location', formData.location);
        fd.append('tags', JSON.stringify(formData.tags));
        await memoriesApi.upload(fd);
        setUploadProgress((p) => ({ ...p, [i]: 'done' }));
      } catch {
        setUploadProgress((p) => ({ ...p, [i]: 'error' }));
        toast.error(`Failed to upload: ${files[i].file.name}`);
      }
    }

    setUploading(false);
    toast.success(`✨ ${files.length} memories saved!`, {
      style: { background: '#4a0f22', color: '#fdf6f0', borderRadius: '12px' },
    });
    onSuccess();
    onClose();
  };

  const current = files[selected];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        style={{ background: 'rgba(74, 15, 34, 0.7)', backdropFilter: 'blur(12px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card rounded-t-3xl sm:rounded-3xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(201,116,138,0.2)' }}>
            <div>
              <h2 className="font-serif text-xl md:text-2xl font-bold gradient-text-rose">Add New Memories</h2>
              <p className="text-xs md:text-sm mt-1 hidden sm:block" style={{ color: '#c9748a' }}>Upload photos and add details to preserve the moment</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 transition-colors" style={{ color: '#a0354f' }}>
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {files.length === 0 ? (
              /* Drop zone */
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 md:p-16 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive ? 'border-dusty-pink bg-blush/50' : 'border-rose hover:border-dusty-pink hover:bg-blush/30'
                }`}
                style={{ borderColor: isDragActive ? '#c9748a' : 'rgba(201,116,138,0.4)' }}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-soft"
                    style={{ background: 'linear-gradient(135deg, rgba(160,53,79,0.15), rgba(201,116,138,0.25))' }}>
                    <Upload size={36} style={{ color: '#c9748a' }} />
                  </div>
                  <div>
                    <p className="font-serif text-xl font-semibold" style={{ color: '#4a0f22' }}>
                      {isDragActive ? 'Drop your memories here...' : 'Drag & drop photos here'}
                    </p>
                    <p className="text-sm mt-2" style={{ color: '#c9748a' }}>or click to browse your gallery</p>
                    <p className="text-xs mt-1 opacity-60" style={{ color: '#a0354f' }}>
                      Supports JPG, PNG, WebP — up to 20MB each
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 h-full">
                {/* Image strip — horizontal on mobile, vertical on desktop */}
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-28 flex-shrink-0 pb-2 md:pb-0 md:pr-2">
                  {files.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelected(idx)}
                      className={`relative rounded-xl overflow-hidden flex-shrink-0 w-16 h-16 md:w-full md:aspect-square border-2 transition-all duration-200 ${
                        idx === selected ? 'border-dusty-pink shadow-rose-glow' : 'border-transparent hover:border-rose'
                      }`}
                      style={{ borderColor: idx === selected ? '#c9748a' : '' }}
                    >
                      <img src={f.preview} alt="" className="w-full h-full object-cover" />
                      {uploadProgress[idx] === 'done' && (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: 'rgba(160, 53, 79, 0.6)' }}>
                          <span className="text-2xl">✓</span>
                        </div>
                      )}
                      {uploadProgress[idx] === 'pending' && (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: 'rgba(74, 15, 34, 0.6)' }}>
                          <Loader2 size={20} className="animate-spin text-white" />
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(74, 15, 34, 0.8)' }}
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </button>
                  ))}

                  {/* Add more */}
                  <div
                    {...getRootProps()}
                    className="flex-shrink-0 w-16 h-16 md:w-full md:aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors hover:bg-blush/30"
                    style={{ borderColor: 'rgba(201,116,138,0.4)' }}
                  >
                    <input {...getInputProps()} />
                    <Plus size={20} style={{ color: '#c9748a' }} />
                  </div>
                </div>

                {/* Right: form */}
                {current && (
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="hidden md:block w-40 flex-shrink-0">
                      <img
                        src={current.preview}
                        alt=""
                        className="w-full rounded-2xl object-cover shadow-card"
                        style={{ maxHeight: 300 }}
                      />
                    </div>

                    {/* Fields */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block" style={{ color: '#a0354f' }}>Title *</label>
                        <input
                          className="romantic-input"
                          placeholder="Give this memory a name..."
                          value={current.formData.title}
                          onChange={(e) => updateField(selected, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block" style={{ color: '#a0354f' }}>Caption</label>
                        <input
                          className="romantic-input"
                          placeholder="A short caption for this photo..."
                          value={current.formData.caption}
                          onChange={(e) => updateField(selected, 'caption', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block" style={{ color: '#a0354f' }}>Story</label>
                        <textarea
                          className="romantic-input resize-none"
                          rows={3}
                          placeholder="Tell the story behind this moment..."
                          value={current.formData.description}
                          onChange={(e) => updateField(selected, 'description', e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-1 flex items-center gap-1" style={{ color: '#a0354f' }}>
                            <Calendar size={13} /> Date
                          </label>
                          <input
                            type="date"
                            className="romantic-input"
                            value={current.formData.date}
                            onChange={(e) => updateField(selected, 'date', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-1 flex items-center gap-1" style={{ color: '#a0354f' }}>
                            <MapPin size={13} /> Location
                          </label>
                          <input
                            className="romantic-input"
                            placeholder="Where was this?"
                            value={current.formData.location}
                            onChange={(e) => updateField(selected, 'location', e.target.value)}
                          />
                        </div>
                      </div>
                      {/* Tags */}
                      <div>
                        <label className="text-sm font-medium mb-1 flex items-center gap-1" style={{ color: '#a0354f' }}>
                          <Tag size={13} /> Tags
                        </label>
                        <div className="flex gap-2">
                          <input
                            className="romantic-input flex-1"
                            placeholder="Add a tag and press Enter..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTag(selected)}
                          />
                          <button
                            onClick={() => addTag(selected)}
                            className="px-3 py-2 rounded-xl text-sm btn-rose"
                          >
                            Add
                          </button>
                        </div>
                        {current.formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {current.formData.tags.map((tag) => (
                              <span
                                key={tag}
                                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                                style={{ background: 'rgba(201,116,138,0.15)', color: '#a0354f' }}
                              >
                                #{tag}
                                <button onClick={() => removeTag(selected, tag)}>
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {files.length > 0 && (
            <div className="p-6 border-t flex items-center justify-between" style={{ borderColor: 'rgba(201,116,138,0.2)' }}>
              <p className="text-sm" style={{ color: '#c9748a' }}>
                {files.length} photo{files.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-ghost-rose px-6 py-3 rounded-xl font-medium">
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-rose flex items-center gap-2 px-8 py-3 rounded-xl font-semibold"
                >
                  {uploading ? (
                    <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Image size={18} /> Save Memories ({files.length})</>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
