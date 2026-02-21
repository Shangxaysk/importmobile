import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 1. AuthGuard qo'shildi
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', { // 2. Rasm qabul qilish
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `cat-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // Frontenddan "true"/"false" string keladi, uni booleanga o'giramiz
    const hasSpecs = body.hasSpecs === 'true';
    
    // ParentId bo'sh string kelsa null qilamiz, yo'qsa raqam
    const parentId = body.parentId ? Number(body.parentId) : null;

    const imagePath = file ? `/uploads/${file.filename}` : null;

    return this.categoriesService.create({
      ...body,
      hasSpecs,
      parentId,
    }, imagePath);
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
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `cat-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const hasSpecs = body.hasSpecs === 'true';
    const parentId = body.parentId ? Number(body.parentId) : null;
    
    const imagePath = file ? `/uploads/${file.filename}` : undefined;

    return this.categoriesService.update(+id, {
      ...body,
      hasSpecs,
      parentId
    }, imagePath);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}