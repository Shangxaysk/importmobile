import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // RAMga o'tdik
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UploadService } from '../upload/upload.service';

@Controller('banners')
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly uploadService: UploadService // ImgBB xizmati
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Faqat rasm (jpg, png, gif, webp) mumkin!'), false);
      }
      cb(null, true);
    }
  }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() dto: any) {
    if (!file) throw new BadRequestException('Rasm yuklanmadi!');
    
    // ImgBB ga yuklash
    const result = await this.uploadService.uploadFile(file);
    const imagePath = result.secure_url;
    
    return this.bannersService.create(dto, imagePath);
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
