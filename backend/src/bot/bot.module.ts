import { Module, forwardRef } from '@nestjs/common';
import { BotService } from './bot.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersModule } from '../orders/orders.module'; 
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from '../upload/upload.module'; // <--- 1. SHU QATOR QO'SHILDI

@Module({
  imports: [
    // OrdersModule bilan BotModule bir-biriga bog'langan bo'lsa (Circular Dependency),
    // forwardRef ishlatish juda to'g'ri qaror.
    forwardRef(() => OrdersModule),
    // ConfigService ishlashi uchun:
    ConfigModule, 
    UploadModule, // <--- 2. SHU YERGA QO'SHILDI
  ],
  providers: [
    BotService, 
    PrismaService
  ],
  exports: [BotService], 
})
export class BotModule {}