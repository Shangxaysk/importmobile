import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Yangi DTO ni shu yerda e'lon qilib qo'ya qolamiz (alohida fayl shart emas)
class CreateBannerDto {
  title?: string;
  linkType: 'PRODUCT' | 'CATEGORY' | 'EXTERNAL';
  linkValue: string; // ID yoki URL
  badgeText?: string;
  badgeStyle?: string;
  isActive?: string; // Form-data dan string bo'lib keladi
}

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `banner-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
       // GIF FORMATI QO'SHILDI
       if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
           return cb(new BadRequestException('Faqat rasm (jpg, png, gif, webp) mumkin!'), false);
       }
       cb(null, true);
    }
  }))
  create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateBannerDto) {
    if (!file) throw new BadRequestException('Rasm yuklanmadi!');
    
    const imagePath = `http://localhost:3000/uploads/${file.filename}`;
    
    return this.bannersService.create({
      ...dto,
      isActive: dto.isActive === 'true', // Stringni booleanga o'giramiz
    }, imagePath);
  }

  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  @Patch(':id/toggle')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  toggleActive(@Param('id') id: string) {
    return this.bannersService.toggleActive(+id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(+id);
  }
}