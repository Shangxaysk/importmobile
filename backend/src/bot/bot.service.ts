import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf, Markup } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import axios from 'axios';
import FormData = require('form-data'); // ImgBB uchun kerak
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {
    this.bot.action(/^approve_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'APPROVE'));
    this.bot.action(/^fraud_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_FRAUD'));
    this.bot.action(/^wrong_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_WRONG_IMAGE'));
    this.bot.action(/^reject_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_OTHER'));

    this.bot.on('photo', (ctx) => this.handleUserPhoto(ctx));
  }

  // 1. IMGBB GA YUKLASH (Eski downloadFile o'rniga)
  private async uploadToImgBB(fileId: string): Promise<string> {
    try {
      // Telegramdan fayl linkini olamiz
      const fileLink = await this.bot.telegram.getFileLink(fileId);
      
      // ImgBB API kaliti
      const apiKey = process.env.IMGBB_API_KEY;

      // Rasmni Telegram serveridan stream ko'rinishida olamiz
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');

      const formData = new FormData();
      formData.append('image', base64Image);

      const imgbbResponse = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        formData,
        { headers: formData.getHeaders() }
      );

      return imgbbResponse.data.data.url; // HTTPS link qaytaradi
    } catch (e) {
      console.error("ImgBB yuklashda xato (Bot):", e);
      throw new Error("Rasm yuklanmadi");
    }
  }

  // 2. YANGI BUYURTMANI ADMINGA YUBORISH
  async sendOrderToAdmin(orderData: any, passportData: any) {
    const groupId = this.configService.get<string>('TELEGRAM_GROUP_ID') || '';
    const topicId = this.configService.get<string>('TELEGRAM_TOPIC_ORDERS') || '0';

    if (!groupId) return;

    const message = `
📦 <b>Yangi Buyurtma:</b> <code>${orderData.id}</code>

👤 <b>Mijoz:</b> ${orderData.user?.fullName || 'Noma\'lum'}
📞 <b>Tel:</b> <code>${orderData.contactPhone}</code>
📩 <b>TG:</b> ${orderData.telegramUser ? `@${orderData.telegramUser}` : 'Yo\'q'}

📍 <b>Manzil:</b> <code>${orderData.address}</code>
💰 <b>Summa:</b> <b>${Number(orderData.totalPrice).toLocaleString()} $</b>
💬 <b>Izoh:</b> ${orderData.comment || 'Yo\'q'}

--------------------------------
🛂 <b>PASPORT:</b>
<blockquote><b>Seriya:</b> ${passportData.seria} ${passportData.number}\n<b>PINFL:</b> <code>${passportData.pinfl}</code></blockquote>
`;

    try {
      // paymentReceipt endi har doim URL bo'ladi
      const photo = orderData.paymentReceipt;

      if (photo && photo.startsWith('http')) {
        await this.bot.telegram.sendPhoto(groupId, photo, {
          caption: message,
          parse_mode: 'HTML',
          message_thread_id: Number(topicId),
          ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Qabul', `approve_${orderData.id}`)],
            [Markup.button.callback('🚫 Fake Chek', `fraud_${orderData.id}`)],
            [Markup.button.callback('⚠️ Rasm Xato', `wrong_${orderData.id}`)]
          ])
        });
      } else {
        await this.bot.telegram.sendMessage(groupId, message, {
          parse_mode: 'HTML',
          message_thread_id: Number(topicId)
        });
      }
    } catch (e) {
      console.error("Telegram send error:", e);
    }
  }

  // 3. MIJOZ QAYTA CHEK YUBORGANDA
  async handleUserPhoto(ctx: any) {
    const message = ctx.message;
    if (!message || !message.reply_to_message) return;

    const replyText = message.reply_to_message.text || message.reply_to_message.caption || "";
    const orderIdMatch = replyText.match(/#IMPRT\d+/);
    if (!orderIdMatch) return;

    const orderId = orderIdMatch[0];
    const fileId = message.photo[message.photo.length - 1].file_id;
    const groupId = this.configService.get<string>('TELEGRAM_GROUP_ID') || '';
    const topicId = this.configService.get<string>('TELEGRAM_TOPIC_ORDERS') || '0';

    try {
      const waitMsg = await ctx.reply("⌛️ <b>Chek ImgBB hostingiga yuklanmoqda...</b>", { parse_mode: 'HTML' });
      
      // ImgBB ga yuklash
      const newImageUrl = await this.uploadToImgBB(fileId);
      
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentReceipt: newImageUrl,
          status: 'NEW',
          isMessageRead: true 
        },
        include: { user: true }
      });

      await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id);
      await ctx.reply(`✅ <b>Muvaffaqiyatli!</b>\n\n${orderId} cheki yangilandi.`, { parse_mode: 'HTML' });
      
      if (groupId) {
        await this.bot.telegram.sendPhoto(groupId, fileId, {
          caption: `🔄 <b>YANGI CHEK!</b>\n🆔 <code>${orderId}</code>\n👤 Mijoz: ${(updatedOrder as any).user?.fullName}`,
          parse_mode: 'HTML',
          message_thread_id: Number(topicId),
          ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Qabul qilish', `approve_${orderId}`)],
            [Markup.button.callback('❌ Rad etish', `reject_${orderId}`)]
          ])
        });
      }
    } catch (e) {
      console.error("UserPhoto error:", e);
      await ctx.reply("❌ Rasm yuklashda xatolik.");
    }
  }

  async handleAdminAction(ctx: any, action: string) {
    const orderId = ctx.match[1];
    try {
      await this.ordersService.updateStatus(orderId, action);
      await ctx.answerCbQuery("Bajarildi ✅");
      const oldCaption = ctx.update.callback_query.message.caption || "";
      await ctx.editMessageCaption(oldCaption + `\n\n✅ <b>STATUS: ${action}</b>`, { parse_mode: 'HTML' });
    } catch (e) {
      await ctx.answerCbQuery("Xato!");
    }
  }

  async sendMessageToUser(telegramId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
    } catch (e) {}
  }
}
