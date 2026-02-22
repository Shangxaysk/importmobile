import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(), // Faylni RAMga olamiz
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Fayl yuklanmadi!");
    }

    // Faylni ImgBB'ga (UploadService orqali) yuklaymiz
    const result = await this.uploadService.uploadFile(file);

    // Frontendga tayyor HTTPS URL ni qaytaramiz
    return { 
      url: result.secure_url 
    };
  }
}