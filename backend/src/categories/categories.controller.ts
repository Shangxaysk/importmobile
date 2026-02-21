import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // RAMga saqlash
import { UploadService } from '../upload/upload.service'; // Cloudinary servisi

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly uploadService: UploadService // Servisni ulaymiz
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imagePath = null;
    
    if (file) {
      const uploadResult = await this.uploadService.uploadFile(file);
      imagePath = uploadResult.secure_url; // Cloudinary HTTPS linki
    }

    const hasSpecs = String(body.hasSpecs) === 'true';
    const parentId = body.parentId && body.parentId !== 'null' ? Number(body.parentId) : null;

    return this.categoriesService.create({ ...body, hasSpecs, parentId }, imagePath);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imagePath = undefined;

    if (file) {
      const uploadResult = await this.uploadService.uploadFile(file);
      imagePath = uploadResult.secure_url;
    }

    const hasSpecs = String(body.hasSpecs) === 'true';
    const parentId = body.parentId && body.parentId !== 'null' ? Number(body.parentId) : null;

    return this.categoriesService.update(+id, { ...body, hasSpecs, parentId }, imagePath);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}