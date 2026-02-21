import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { BotModule } from '../bot/bot.module'; // <--- BotModule import qilinishi kerak

@Module({
  imports: [
    // BotModule forwardRef bilan bo'lishi SHART:
    forwardRef(() => BotModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService], // <--- OrdersService boshqa joyda ko'rinishi uchun EXPORT shart!
})
export class OrdersModule {}