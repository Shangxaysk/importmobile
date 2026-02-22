import { 
  Controller, Get, Post, Body, Patch, Param, UseGuards, Request 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req: any, @Body() body: any) {
    return this.ordersService.create(req.user.id, body);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  findMyOrders(@Request() req: any) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  markRead(@Param('id') id: string) {
    return this.ordersService.markMessageAsRead(id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string, 
    @Body() body: { action: string, reason?: string }
  ) {
    return this.ordersService.updateStatus(id, body.action, body.reason);
  }

  @Post(':id/message')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateAdminMessage(@Param('id') id: string, @Body('message') message: string) {
    return this.ordersService.updateAdminMessage(id, message);
  }

  // BOT ORQALI CHEKNI YANGILASH (Public API)
  @Patch(':id/update-receipt')
  updateReceipt(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    // imageUrl bot tomonidan ImgBB ga yuklanib, tayyor link bo'lib keladi
    return this.ordersService.updateReceiptFromBot(id, imageUrl);
  }
}