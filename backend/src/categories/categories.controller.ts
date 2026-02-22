// src/categories/categories.controller.ts
import { 
  Controller, Post, Body, Patch, Param, UseInterceptors, UploadedFile, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from '../upload/upload.service';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly uploadService: UploadService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imagePath = null;
    if (file) {
      const res = await this.uploadService.uploadFile(file);
      imagePath = res.secure_url; // https://i.ibb.co/...
    }

    return this.categoriesService.create({
      ...body,
      hasSpecs: String(body.hasSpecs) === 'true',
      parentId: body.parentId && body.parentId !== 'null' ? Number(body.parentId) : null,
    }, imagePath);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imagePath = undefined;
    if (file) {
      const res = await this.uploadService.uploadFile(file);
      imagePath = res.secure_url;
    }

    return this.categoriesService.update(+id, {
      ...body,
      hasSpecs: String(body.hasSpecs) === 'true',
      parentId: body.parentId && body.parentId !== 'null' ? Number(body.parentId) : null,
    }, imagePath);
  }
}