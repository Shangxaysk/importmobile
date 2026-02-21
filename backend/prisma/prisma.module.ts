import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <-- Bu juda muhim! Endi har bir joyda import qilib o'tirish shart emas
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- Boshqa modullar ishlata olishi uchun
})
export class PrismaModule {}