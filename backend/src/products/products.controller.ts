import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFiles 
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
    // Rasm URL'lari uchun massiv (Type-safe)
    let imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      // Barcha fayllarni ImgBB ga yuboramiz va natijalarni kutamiz
      const uploadPromises = files.map(file => this.uploadService.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      // Natijalardan secure_url'ni olib massivga yig'amiz
      imageUrls = results.map((res: any) => res.secure_url);
    }

    // Specifications string bo'lib kelsa, uni obyektga aylantiramiz
    let specs = body.specifications; 
    if (typeof specs === 'string') {
      try { 
        specs = JSON.parse(specs); 
      } catch (e) { 
        specs = {}; 
      }
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
      try { 
        specs = JSON.parse(specs); 
      } catch (e) { 
        // Xato bo'lsa hech narsa qilmaymiz
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
  findAll() { 
    return this.productsService.findAll(); 
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