import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import { Request, Response, NextFunction } from 'express';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Use memory storage — file goes to Cloudinary directly
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

export const uploadToCloudinary = (
  buffer: Buffer,
  folder = 'our-little-universe'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export const getThumbUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto:low', fetch_format: 'auto' },
    ],
    secure: true,
  });
};
