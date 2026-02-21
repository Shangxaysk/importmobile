import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. BUYURTMA YARATISH
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req: any, @Body() body: any) {
    return this.ordersService.create(req.user.id, body);
  }

  // 2. MIJOZ O'Z BUYURTMALARINI KO'RISHI
  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  findMyOrders(@Request() req: any) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  // 3. MIJOZ XABARNI O'QILGAN DEB BELGILASHI (Emerald indikatorni o'chirish)
  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  markRead(@Param('id') id: string) {
    return this.ordersService.markMessageAsRead(id);
  }

  // 4. ADMIN BARCHA BUYURTMALARNI KO'RISHI
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.ordersService.findAll();
  }

  // 5. ADMIN BUYURTMANI BOSHQARISHI (APPROVE/REJECT)
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string, 
    @Body() body: { action: string, reason?: string }
  ) {
    return this.ordersService.updateStatus(id, body.action, body.reason);
  }

  // 6. ADMIN MIJOZGA #IMPRT XABARI YUBORISHI
  // Izoh: Frontend dagi AdminOrders.tsx dan '/admin/orders/:id/message' ga emas, 
  // '/orders/:id/message' ga yuboradigan qilib koddagi URLni to'g'irlab qo'yishingiz kerak
  @Post(':id/message')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateAdminMessage(@Param('id') id: string, @Body('message') message: string) {
    return this.ordersService.updateAdminMessage(id, message);
  }

  // 7. BOT ORQALI CHEKNI YANGILASH (Public yoki maxsus Guard bilan bo'lishi mumkin)
  @Patch(':id/update-receipt')
  updateReceipt(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    return this.ordersService.updateReceiptFromBot(id, imageUrl);
  }
}