import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    // Agar bu yerda qizil bo'lsa, ConfigService importini tekshiring
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
    const fileKey = `uploads/${Date.now()}-${file.originalname?.replace(/\s/g, '_') || 'file.jpg'}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype || 'image/jpeg',
      });

      await this.s3Client.send(command);
      
      const endpoint = (this.configService.get<string>('AWS_ENDPOINT') || '').replace(/\/$/, '');
      const url = `${endpoint}/${bucket}/${fileKey}`;

      return { secure_url: url };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Rasm S3 ga yuklanmadi');
    }
  }
}