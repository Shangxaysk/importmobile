import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { UploadModule } from '../upload/upload.module'; // 👈 Yo'lni tekshiring
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [UploadModule], // 👈 UploadService'ni emas, modulni o'zini import qiling
  controllers: [BannersController],
  providers: [BannersService, PrismaService],
})
export class BannersModule {}