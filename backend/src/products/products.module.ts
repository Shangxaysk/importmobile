import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UploadService } from '../upload/upload.service'; // Qo'shildi

@Module({
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, UploadService], // UploadService qo'shildi
})
export class ProductsModule {}