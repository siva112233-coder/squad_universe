export interface Memory {
  _id: string;
  title: string;
  caption: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  thumbnailUrl: string;
  publicId: string;
  isFavorite: boolean;
  tags: string[];
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  favorites: number;
}

export interface UploadFormData {
  title: string;
  caption: string;
  description: string;
  date: string;
  location: string;
  tags: string[];
}

export interface ImageAdjustments {
  brightness: number;   // 0-200 (100 = normal)
  contrast: number;     // 0-200
  saturation: number;   // 0-200
  exposure: number;     // -100 to 100
  warmth: number;       // -100 to 100
  blur: number;         // 0-10
  sharpness: number;    // 0-10
}

export type FilterPreset = 'none' | 'romantic' | 'vintage' | 'dreamy' | 'warm' | 'cinematic' | 'bw';

export interface EditorState {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
  adjustments: ImageAdjustments;
  filter: FilterPreset;
}
