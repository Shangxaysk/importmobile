import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from '../upload/upload.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly uploadService: UploadService
  ) {}

  // 1. KATEGORIYA QO'SHISH (ImgBB bilan)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imagePath = null;
    if (file) {
      const res = await this.uploadService.uploadFile(file);
      imagePath = res.secure_url;
    }

    const hasSpecs = String(body.hasSpecs) === 'true';
    const parentId = body.parentId && body.parentId !== 'null' && body.parentId !== '' 
      ? Number(body.parentId) 
      : null;

    return this.categoriesService.create({
      ...body,
      hasSpecs,
      parentId,
    }, imagePath);
  }

  // 👇 MANA SHU QISMLAR TUSHIB QOLGAN EDI 👇

  // 2. BARCHA KATEGORIYALARNI OLISH
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // 3. BITTA KATEGORIYANI OLISH
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  // 4. KATEGORIYANI TAHRIRLASH (ImgBB bilan)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imagePath = undefined;
    if (file) {
      const res = await this.uploadService.uploadFile(file);
      imagePath = res.secure_url;
    }

    const hasSpecs = String(body.hasSpecs) === 'true';
    const parentId = body.parentId && body.parentId !== 'null' && body.parentId !== '' 
      ? Number(body.parentId) 
      : null;

    return this.categoriesService.update(+id, {
      ...body,
      hasSpecs,
      parentId
    }, imagePath);
  }

  // 5. KATEGORIYANI O'CHIRISH
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}