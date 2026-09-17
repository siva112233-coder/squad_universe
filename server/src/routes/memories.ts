import { Router, Request, Response } from 'express';
import { Memory } from '../models/Memory';
import {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  getThumbUrl,
  cloudinary,
} from '../middleware/upload';

const router = Router();

// GET /api/memories — list all memories
router.get('/', async (req: Request, res: Response) => {
  try {
    const { favorites, sort } = req.query;
    const query: Record<string, unknown> = {};
    if (favorites === 'true') query.isFavorite = true;

    const sortOrder = sort === 'oldest' ? { date: 1 as const } : { date: -1 as const };
    const memories = await Memory.find(query).sort(sortOrder);
    res.json({ success: true, data: memories, count: memories.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch memories', error });
  }
});

// GET /api/memories/stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const total = await Memory.countDocuments();
    const favorites = await Memory.countDocuments({ isFavorite: true });
    res.json({ success: true, data: { total, favorites } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error });
  }
});

// POST /api/memories — upload new memory
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    const { title, caption, description, date, location, tags } = req.body;

    const cloudResult = await uploadToCloudinary(req.file.buffer);
    const thumbnailUrl = getThumbUrl(cloudResult.public_id);

    const memory = await Memory.create({
      title: title || 'Untitled Memory',
      caption: caption || '',
      description: description || '',
      date: date ? new Date(date) : new Date(),
      location: location || '',
      imageUrl: cloudResult.secure_url,
      thumbnailUrl,
      publicId: cloudResult.public_id,
      isFavorite: false,
      tags: tags ? JSON.parse(tags) : [],
      width: cloudResult.width,
      height: cloudResult.height,
    });

    res.status(201).json({ success: true, data: memory });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload memory', error });
  }
});

// PUT /api/memories/:id — update metadata (or replace image)
router.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { title, caption, description, date, location, tags } = req.body;
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      res.status(404).json({ success: false, message: 'Memory not found' });
      return;
    }

    const updateData: Partial<{
      title: string;
      caption: string;
      description: string;
      date: Date;
      location: string;
      tags: string[];
      imageUrl: string;
      thumbnailUrl: string;
      publicId: string;
      width: number;
      height: number;
    }> = {};

    if (title !== undefined) updateData.title = title;
    if (caption !== undefined) updateData.caption = caption;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (location !== undefined) updateData.location = location;
    if (tags !== undefined) updateData.tags = JSON.parse(tags);

    // If a new edited image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      await deleteFromCloudinary(memory.publicId);
      const cloudResult = await uploadToCloudinary(req.file.buffer);
      updateData.imageUrl = cloudResult.secure_url;
      updateData.thumbnailUrl = getThumbUrl(cloudResult.public_id);
      updateData.publicId = cloudResult.public_id;
      updateData.width = cloudResult.width;
      updateData.height = cloudResult.height;
    }

    // Handle base64 edited image (from canvas editor)
    if (req.body.editedImageBase64) {
      const base64Data = req.body.editedImageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      await deleteFromCloudinary(memory.publicId);
      const cloudResult = await uploadToCloudinary(buffer);
      updateData.imageUrl = cloudResult.secure_url;
      updateData.thumbnailUrl = getThumbUrl(cloudResult.public_id);
      updateData.publicId = cloudResult.public_id;
      updateData.width = cloudResult.width;
      updateData.height = cloudResult.height;
    }

    const updated = await Memory.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update memory', error });
  }
});

// PATCH /api/memories/:id/favorite — toggle favorite
router.patch('/:id/favorite', async (req: Request, res: Response) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      res.status(404).json({ success: false, message: 'Memory not found' });
      return;
    }
    memory.isFavorite = !memory.isFavorite;
    await memory.save();
    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle favorite', error });
  }
});

// DELETE /api/memories/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      res.status(404).json({ success: false, message: 'Memory not found' });
      return;
    }
    await deleteFromCloudinary(memory.publicId);
    await Memory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Memory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete memory', error });
  }
});

export default router;
