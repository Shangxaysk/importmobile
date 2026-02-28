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
// Agar keyinchalik JWT Guard kerak bo'lsa, izohdan chiqarasiz:
// import { AuthGuard } from '@nestjs/passport'; 
// import { RolesGuard } from '../auth/roles.guard'; 
// import { Roles } from '../auth/roles.decorator';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(), // S3 ga jo'natish uchun faylni RAM da ushlab turamiz
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, callback) => {
      // Faqat rasm formatlariga ruxsat
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

    // Faylni xotiradan to'g'ri UploadService ga uzatamiz
    const result = await this.uploadService.uploadFile(file);

    // Tayyor, toza va xavfsiz URL ni frontendga qaytaramiz
    return { 
      url: result.secure_url 
    };
  }
}