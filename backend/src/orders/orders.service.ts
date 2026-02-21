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

  // 1. BUYURTMA YARATISH
  async create(userId: number, dto: any) {
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException("Buyurtma uchun mahsulotlar (items) tanlanmagan!");
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
          totalPrice: dto.totalPrice,
          paymentReceipt: dto.paymentReceipt,
          status: 'NEW',
          deliveryDays: 15,
          items: {
            create: dto.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
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
          console.error("Botga yuborishda xato, lekin buyurtma saqlandi:", e);
      }

      return order;
    } catch (error) {
      console.error("Buyurtma yaratishda baza xatosi:", error);
      throw new HttpException("Buyurtma yaratishda xatolik yuz berdi", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 2. ADMIN UCHUN HAMMA BUYURTMALAR
  async findAll() {
    return this.prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. MIJOZ UCHUN O'Z BUYURTMALARI
  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. ADMIN TOMONIDAN STATUSNI O'ZGARTIRISH
  async updateStatus(id: string, action: string, reason?: string) {
    const order = await this.prisma.order.findUnique({ 
      where: { id },
      include: { user: true } 
    });

    if (!order) throw new NotFoundException("Buyurtma topilmadi");

    let newStatus = order.status;
    let notifyMessage = "";

    switch (action) {
      case 'APPROVE':
        newStatus = 'APPROVED';
        notifyMessage = `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n🆔: ${order.id}\nTez orada yetkazib berish jarayoni boshlanadi.`;
        break;

      case 'REJECT_FRAUD':
        newStatus = 'REJECTED';
        await this.prisma.user.update({
          where: { id: order.userId },
          data: { isBlocked: true }
        });
        notifyMessage = `🚫 <b>Sizning hisobingiz bloklandi!</b>\n\nSabab: Yolg'on to'lov cheki aniqlandi.`;
        break;

      case 'REJECT_WRONG_IMAGE':
        newStatus = 'WAITING_CHECK';
        notifyMessage = `⚠️ <b>To'lov chekida xatolik!</b>\n\n🆔: ${order.id}\nSiz yuklagan chek rasmi xato yoki sifatsiz.\n\n🔄 <b>Iltimos, haqiqiy chekni botga qaytadan yuboring.</b>`;
        break;

      case 'REJECT_OTHER':
        newStatus = 'REJECTED';
        notifyMessage = `❌ <b>Buyurtma bekor qilindi.</b>\n\n🆔: ${order.id}\n💬 Sabab: ${reason || "Noma'lum"}`;
        break;
      
      default:
        newStatus = action as any; 
        break;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { 
        status: newStatus,
        rejectReason: reason || action
      }
    });

    if (order.user.telegramId) {
      try {
        await this.botService.sendMessageToUser(order.user.telegramId, notifyMessage);
      } catch (e) {
        console.warn(`Telegram xabar yuborilmadi: ${order.user.telegramId}`);
      }
    }

    return updatedOrder;
  }

  // 5. BOT ORQALI CHEKNI YANGILASH
  async updateReceiptFromBot(orderId: string, imageUrl: string) {
    const order = await this.prisma.order.findUnique({ 
      where: { id: orderId } 
    });

    if (!order) throw new NotFoundException("Buyurtma topilmadi");

    return this.prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentReceipt: imageUrl,
        status: 'NEW', 
        isMessageRead: true 
      }
    });
  }

  // 6. ADMIN XABARINI YANGILASH (#IMPRT CHAT LOGIKASI)
 async updateAdminMessage(id: string, newMessage: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException("Buyurtma topilmadi");

    // XATONI TO'G'IRLASH: Massiv turini any[] yoki interface orqali belgilaymiz
    let messageHistory: any[] = []; 
    
    try {
      if (order.adminMessage) {
        const parsed = JSON.parse(order.adminMessage);
        messageHistory = Array.isArray(parsed) ? parsed : [{ text: order.adminMessage, date: order.updatedAt }];
      }
    } catch (e) {
      // Agar JSON bo'lmasa, oddiy string deb hisoblaymiz
      messageHistory = [{ text: order.adminMessage, date: order.updatedAt }];
    }

    const updatedHistory = JSON.stringify([
      { text: newMessage, date: new Date() },
      ...messageHistory
    ]);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { 
        adminMessage: updatedHistory,
        isMessageRead: false 
      },
      include: { user: true }
    });

    if (updatedOrder.user.telegramId) {
        try {
            await this.botService.sendMessageToUser(
                updatedOrder.user.telegramId, 
                `🔔 <b>Yangi bildirishnoma (#${updatedOrder.id}):</b>\n\n${newMessage}`
            );
        } catch (e) {}
    }

    return updatedOrder;
  }

  // 7. XABARNI O'QILGAN DEB BELGILASH
  async markMessageAsRead(id: string) {
    return this.prisma.order.update({
      where: { id },
      data: { isMessageRead: true }
    });
  }
}