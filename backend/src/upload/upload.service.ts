import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  constructor() {
    // Cloudinary sozlamalari (Bularni .env dan olamiz)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadFile(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'importmobile' }, // Cloudinary ichida 'importmobile' degan papkaga tushadi
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      // Faylni xotiradan (buffer) oqimga (stream) o'tkazib jo'natamiz
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}