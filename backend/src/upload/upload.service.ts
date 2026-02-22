import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<any> {
    const apiKey = process.env.IMGBB_API_KEY;
    
    // Rasmni base64 formatiga o'tkazamiz
    const base64Image = file.buffer.toString('base64');

    // ImgBB base64 ma'lumotni URLSearchParams orqali ham qabul qiladi
    const params = new URLSearchParams();
    params.append('image', base64Image);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return { secure_url: response.data.data.url };
    } catch (error: any) {
      console.error('ImgBB error:', error.response?.data || error.message);
      throw new Error('Rasm yuklanmadi');
    }
  }
}