import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFiles, Query 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from '../upload/upload.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly uploadService: UploadService
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 5, { storage: memoryStorage() }))
  async create(
    @UploadedFiles() files: Express.Multer.File[], 
    @Body() body: any
  ) {
    let imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.uploadService.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((res: any) => res.secure_url);
    }

    let specs = body.specifications; 
    if (typeof specs === 'string') {
      try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
    }

    const productData = {
      ...body,
      price: Number(body.price),
      categoryId: Number(body.categoryId),
      prepaymentPercent: Number(body.prepaymentPercent || 0),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      images: imageUrls,
      specifications: specs,
    };

    return this.productsService.create(productData);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 5, { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[], 
    @Body() body: any
  ) {
    let newImageUrls: string[] = [];
    
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.uploadService.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      newImageUrls = results.map((res: any) => res.secure_url);
    }

    let specs = body.specifications;
    if (typeof specs === 'string') {
      try { specs = JSON.parse(specs); } catch (e) {}
    }

    const updateData = {
      ...body,
      price: body.price ? Number(body.price) : undefined,
      categoryId: body.categoryId ? Number(body.categoryId) : undefined,
      prepaymentPercent: body.prepaymentPercent ? Number(body.prepaymentPercent) : undefined,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      specifications: specs,
    };

    return this.productsService.update(+id, updateData, newImageUrls);
  }

  // Yangi: Mahsulotni yashirish/ko'rsatish endpointi
  @Patch(':id/toggle-visibility')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  toggleVisibility(@Param('id') id: string) {
    return this.productsService.toggleVisibility(+id);
  }

  // O'zgartirildi: activeOnly query parametrini qabul qiladi
  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) { 
    const isActiveOnly = activeOnly === 'true'; // Agar 'true' kelsa, faqat aktivlari chiqadi
    return this.productsService.findAll(isActiveOnly); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) { 
    return this.productsService.findOne(+id); 
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) { 
    return this.productsService.remove(+id); 
  }
}