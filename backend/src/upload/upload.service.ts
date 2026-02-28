import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
      endpoint: this.configService.get<string>('AWS_ENDPOINT'),
      forcePathStyle: true,
    });
  }

  async uploadFile(file: any): Promise<{ secure_url: string }> {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';
    // Fayl nomidagi bo'sh joylarni pastki chiziqqa almashtiramiz
    const fileKey = `uploads/${Date.now()}-${file.originalname?.replace(/\s/g, '_') || 'file.jpg'}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype || 'image/jpeg',
      });

      await this.s3Client.send(command);
      
      // =====================================
      // MUHIM: URL YASASH LOGIKASI
      // =====================================
      const endpoint = this.configService.get<string>('AWS_ENDPOINT');
      const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
      let url = '';

      if (endpoint) {
        // Agar Yandex Cloud yoki boshqa custom S3 bo'lsa
        url = `${endpoint.replace(/\/$/, '')}/${bucket}/${fileKey}`;
      } else {
        // Agar toza Amazon AWS S3 bo'lsa
        url = `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
      }

      // Agar url http/https bilan boshlanmagan bo'lsa (masalan shunchaki /importmobile... bo'lsa), to'g'rilaymiz
      if (!url.startsWith('http')) {
        url = `https://${url.replace(/^\//, '')}`;
      }

      return { secure_url: url };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Rasm S3 ga yuklanmadi');
    }
  }
}