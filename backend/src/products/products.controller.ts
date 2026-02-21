import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFiles 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1. MAHSULOT YARATISH
@Post()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@UseInterceptors(
  FilesInterceptor('images', 5, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `prod-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }),
)
create(
  @UploadedFiles() files: Express.Multer.File[], 
  @Body() body: any // ValidationPipe whitelist: true bo'lsa DTO dan foydalaning
) {
  const imageUrls = files?.map(file => `/uploads/${file.filename}`) || [];
  
  // MUHIM TUZATISH: body.specs emas, body.specifications
  let specs = body.specifications; 
  if (typeof specs === 'string') {
    try { 
      specs = JSON.parse(specs); 
    } catch (e) { 
      specs = {}; 
    }
  }

  const productData = {
    name: body.name,
    description: body.description,
    price: Number(body.price),
    categoryId: Number(body.categoryId),
    prepaymentPercent: Number(body.prepaymentPercent || 0),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    deliveryTime: body.deliveryTime,
    images: imageUrls,
    specifications: specs, // Endi bu bazaga Object bo'lib boradi
  };

  return this.productsService.create(productData);
}

@Patch(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@UseInterceptors(
  FilesInterceptor('images', 5, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `prod-update-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }),
)
async update(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[], 
  @Body() body: any
) {
  const newImageUrls = files?.map(file => `/uploads/${file.filename}`) || [];
  
  // MUHIM TUZATISH: body.specs emas, body.specifications
  let specs = body.specifications;
  if (typeof specs === 'string') {
    try { 
      specs = JSON.parse(specs); 
    } catch (e) { 
      // Agar tahrirlashda yangi specs kelmasa, eskisi qolishi uchun 
      // serviceda mantiq yozilgan, bu yerda shunchaki parseni tekshiramiz
    }
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

  @Get()
  findAll() { return this.productsService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.productsService.findOne(+id); }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) { return this.productsService.remove(+id); }
}