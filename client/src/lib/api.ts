import axios from 'axios';
import type { Memory, Stats } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const memoriesApi = {
  getAll: async (params?: { favorites?: boolean; sort?: 'newest' | 'oldest' }) => {
    const res = await api.get<{ success: boolean; data: Memory[]; count: number }>('/memories', {
      params: {
        favorites: params?.favorites,
        sort: params?.sort,
      },
    });
    return res.data;
  },

  getStats: async () => {
    const res = await api.get<{ success: boolean; data: Stats }>('/memories/stats');
    return res.data;
  },

  upload: async (formData: FormData) => {
    const res = await api.post<{ success: boolean; data: Memory }>('/memories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  update: async (id: string, formData: FormData) => {
    const res = await api.put<{ success: boolean; data: Memory }>(`/memories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateMetadata: async (id: string, data: Partial<Memory>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    const res = await api.put<{ success: boolean; data: Memory }>(`/memories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  saveEditedImage: async (id: string, editedImageBase64: string, metadata?: Partial<Memory>) => {
    const formData = new FormData();
    formData.append('editedImageBase64', editedImageBase64);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }
    const res = await api.put<{ success: boolean; data: Memory }>(`/memories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  toggleFavorite: async (id: string) => {
    const res = await api.patch<{ success: boolean; data: Memory }>(`/memories/${id}/favorite`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/memories/${id}`);
    return res.data;
  },
};
