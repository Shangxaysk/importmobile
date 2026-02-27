import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config'; // 👈 Shu import bormi?

@Module({
  imports: [ConfigModule], // 👈 1. ConfigModule'ni shu yerga qo'shing
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService], // 👈 2. Boshqalar ishlata olishi uchun eksport qiling
})
export class UploadModule {}