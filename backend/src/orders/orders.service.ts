import { Injectable, Inject, forwardRef, NotFoundException, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BotService } from '../bot/bot.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => BotService))
    private botService: BotService,
  ) {}

  async create(userId: number, dto: any) {
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException("Savat bo'sh!");
    }

    try {
      const count = await this.prisma.order.count();
      const orderId = `#IMPRT${(count + 1).toString().padStart(5, '0')}`;

      const order = await this.prisma.order.create({
        data: {
          id: orderId,
          userId: userId,
          address: dto.address,
          contactPhone: dto.contactPhone,
          extraPhone: dto.extraPhone,
          telegramUser: dto.telegramUser,
          comment: dto.comment,
          totalPrice: Number(dto.totalPrice),
          paymentReceipt: dto.paymentReceipt, // ImgBB linki kelsa yaxshi
          status: 'NEW',
          deliveryDays: 15,
          items: {
            create: dto.items.map((item: any) => ({
              productId: Number(item.productId),
              quantity: Number(item.quantity),
              price: Number(item.price),
              config: item.config || 'Standart'
            })),
          },
        },
        include: { user: true, items: { include: { product: true } } },
      });

      const passportData = { 
        seria: dto.passportSeria || '', 
        number: dto.passportNumber || '', 
        pinfl: dto.passportPinfl || '' 
      };
      
      try {
          await this.botService.sendOrderToAdmin(order, passportData);
      } catch (e) {
          console.error("Botga yuborishda xato:", e);
      }

      return order;
    } catch (error) {
      throw new HttpException("Order create error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, action: string, reason?: string) {
    const order = await this.prisma.order.findUnique({ 
      where: { id },
      include: { user: true } 
    });

    if (!order) throw new NotFoundException("Topilmadi");

    let newStatus = order.status;
    let notifyMessage = "";

    switch (action) {
      case 'APPROVE':
        newStatus = 'APPROVED';
        notifyMessage = `✅ <b>Buyurtmangiz qabul qilindi!</b>\n🆔: ${order.id}`;
        break;
      case 'REJECT_FRAUD':
        newStatus = 'REJECTED';
        await this.prisma.user.update({ where: { id: order.userId }, data: { isBlocked: true } });
        notifyMessage = `🚫 <b>Bloklandingiz!</b> Fake chek aniqlandi.`;
        break;
      case 'REJECT_WRONG_IMAGE':
        newStatus = 'WAITING_CHECK';
        notifyMessage = `⚠️ <b>To'lov cheki xato!</b>\n🆔: ${order.id}\nIltimos, haqiqiy chekni botga qaytadan yuboring.`;
        break;
      default:
        newStatus = action as any;
        break;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: newStatus, rejectReason: reason }
    });

    if (order.user.telegramId) {
      try { await this.botService.sendMessageToUser(order.user.telegramId, notifyMessage); } catch (e) {}
    }

    return updatedOrder;
  }

  async updateReceiptFromBot(orderId: string, imageUrl: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException("Topilmadi");

    return this.prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentReceipt: imageUrl,
        status: 'NEW', 
        isMessageRead: true 
      }
    });
  }

  async updateAdminMessage(id: string, newMessage: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException("Topilmadi");

    let messageHistory: any[] = []; 
    try {
      if (order.adminMessage) {
        const parsed = JSON.parse(order.adminMessage);
        messageHistory = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) { messageHistory = []; }

    const updatedHistory = JSON.stringify([
      { text: newMessage, date: new Date() },
      ...messageHistory
    ]);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { adminMessage: updatedHistory, isMessageRead: false },
      include: { user: true }
    });

    if (updatedOrder.user.telegramId) {
      try {
        await this.botService.sendMessageToUser(
          updatedOrder.user.telegramId, 
          `🔔 <b>Xabar (#${updatedOrder.id}):</b>\n\n${newMessage}`
        );
      } catch (e) {}
    }

    return updatedOrder;
  }

  async markMessageAsRead(id: string) {
    return this.prisma.order.update({ where: { id }, data: { isMessageRead: true } });
  }
}