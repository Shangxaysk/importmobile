import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { AuthGuard } from '@nestjs/passport'; // Agar faqat adminlar rasm yuklashini xohlasangiz
import { RolesGuard } from '../auth/roles.guard'; // Roles guard bo'lsa
import { Roles } from '../auth/roles.decorator';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  // Agar bu faqat adminlar uchun bo'lsa, quyidagi guardlarni yoqing:
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(), // Faylni vaqtincha xotirada (RAM) ushlab turamiz
    limits: {
      fileSize: 5 * 1024 * 1024, // Maksimal 5MB gacha rasm ruxsat berish
    },
    fileFilter: (req, file, callback) => {
      // Faqat rasmlarni qabul qilish mantiqi
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return callback(new BadRequestException('Faqat rasm fayllari ruxsat etiladi!'), false);
      }
      callback(null, true);
    },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Fayl tanlanmagan!");
    }

    // Faylni S3 xizmatiga (UploadService orqali) yuklaymiz
    const result = await this.uploadService.uploadFile(file);

    // Frontendga S3 dan qaytgan HTTPS URL ni qaytaramiz
    return { 
      url: result.secure_url 
    };
  }
}