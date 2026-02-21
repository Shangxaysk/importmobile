import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AuthModule } from '../auth/auth.module';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    AuthModule // <--- 2. BU YERGA QO'SHING
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService],
})
export class CategoriesModule {}
