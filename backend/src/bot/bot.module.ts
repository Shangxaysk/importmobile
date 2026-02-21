import { Module, forwardRef } from '@nestjs/common';
import { BotService } from './bot.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersModule } from '../orders/orders.module'; 
import { ConfigModule } from '@nestjs/config'; // <--- BU QO'SHILDI

@Module({
  imports: [
    // OrdersModule bilan BotModule bir-biriga bog'langan bo'lsa (Circular Dependency),
    // forwardRef ishlatish juda to'g'ri qaror.
    forwardRef(() => OrdersModule),
    // ConfigService ishlashi uchun:
    ConfigModule, 
  ],
  providers: [
    BotService, 
    PrismaService
  ],
  exports: [BotService], 
})
export class BotModule {}