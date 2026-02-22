import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [
    forwardRef(() => BotModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}