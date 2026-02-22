import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { UploadService } from '../upload/upload.service'; // Qo'shildi
import { PrismaService } from '../../prisma/prisma.service'; // Qo'shildi

@Module({
  providers: [BannersService, UploadService, PrismaService],
  controllers: [BannersController]
})
export class BannersModule {}
