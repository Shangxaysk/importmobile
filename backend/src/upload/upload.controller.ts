import { 
  Controller, Post, Body, Patch, Param, UseInterceptors, UploadedFile, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // Disk emas, RAM
import { UploadService } from '../upload/upload.service'; // Cloudinary xizmati
import { CategoriesService } from '../categories/categories.service'; // Kategoriyalar servisi

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly uploadService: UploadService // Cloudinary servisini ulaymiz
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imagePath = null;

    if (file) {
      // Rasmni Cloudinaryga yuboramiz
      const result = await this.uploadService.uploadFile(file);
      imagePath = result.secure_url; // Endi bazaga /uploads/... emas, https://cloudinary... tushadi
    }

    const hasSpecs = String(body.hasSpecs) === 'true';
    const parentId = body.parentId && body.parentId !== 'null' ? Number(body.parentId) : null;

    return this.categoriesService.create({ ...body, hasSpecs, parentId }, imagePath);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imagePath = undefined;

    if (file) {
      const result = await this.uploadService.uploadFile(file);
      imagePath = result.secure_url;
    }

    const hasSpecs = String(body.hasSpecs) === 'true';
    const parentId = body.parentId && body.parentId !== 'null' ? Number(body.parentId) : null;

    return this.categoriesService.update(+id, { ...body, hasSpecs, parentId }, imagePath);
  }
}