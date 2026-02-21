import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Promise qaytaradigan tipni aniqlashtirdik
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'importmobile' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary result is undefined'));
          resolve(result); // Endi qizil bo'lmaydi
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}