import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf, Markup } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
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
    // Admin harakatlarini ushlash
    this.bot.action(/^approve_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'APPROVE'));
    this.bot.action(/^fraud_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_FRAUD'));
    this.bot.action(/^wrong_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_WRONG_IMAGE'));
    this.bot.action(/^reject_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_OTHER'));

    // Mijoz chek yuborganda ushlash
    this.bot.on('photo', (ctx) => this.handleUserPhoto(ctx));
  }

  // 1. FAYLNI YUKLAB OLISH
  private async downloadFile(fileId: string): Promise<string> {
    try {
      const fileLink = await this.bot.telegram.getFileLink(fileId);
      const fileName = `receipt-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
      const uploadDir = path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      const response = await axios({
        url: fileLink.href,
        method: 'GET',
        responseType: 'stream',
      });

      return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
 writer.on('finish', () => resolve(`/uploads/${fileName}`));
        writer.on('error', reject);
      });
    } catch (e) {
      console.error("Fayl yuklashda xatolik:", e);
      throw e;
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
🛂 <b>PASPORT MA'LUMOTLARI:</b>
<blockquote>
<b>Seriya:</b> ${passportData.seria} ${passportData.number}
<b>PINFL:</b> <code>${passportData.pinfl}</code>
</blockquote>
--------------------------------
`;

    let photo: any = orderData.paymentReceipt;
    if (typeof photo === 'string' && photo.includes('localhost')) {
      const fileName = photo.split('/').pop() || '';
      if (fileName) {
        const filePath = path.join(process.cwd(), 'uploads', fileName);
        if (fs.existsSync(filePath)) {
          photo = { source: fs.createReadStream(filePath) };
        }
      }
    }

    try {
      if (photo) {
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
      console.error("Telegram error:", e);
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
      await ctx.reply("⌛️ <b>Chek qabul qilinmoqda...</b>", { parse_mode: 'HTML' });
      
      const newImageUrl = await this.downloadFile(fileId);
      
      // MUHIM: updatedOrder ichida 'user' bo'lishi uchun Prisma update'da include ishlatamiz
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentReceipt: newImageUrl,
          status: 'NEW',
          isMessageRead: true 
        },
        include: { user: true } // BU YERDA USERNI QO'SHDIK
      });

      await ctx.reply(`✅ <b>Muvaffaqiyatli!</b>\n\n${orderId} cheki yangilandi.`, { parse_mode: 'HTML' });
      
      if (groupId) {
        const adminMsg = `
🔄 <b>YANGI CHEK YUKLANDI!</b>
🆔 Buyurtma: <code>${orderId}</code>

👤 Mijoz: ${(updatedOrder as any).user?.fullName || 'Noma\'lum'}
💰 Summa: <b>${Number(updatedOrder.totalPrice).toLocaleString()} $</b>

<i>Admin, yangi chekni tekshiring:</i>
        `;

        await this.bot.telegram.sendPhoto(groupId, fileId, {
          caption: adminMsg,
          parse_mode: 'HTML',
          message_thread_id: Number(topicId),
          ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Yangi chekni qabul qilish', `approve_${orderId}`)],
            [Markup.button.callback('🚫 Fake Chek (Blok)', `fraud_${orderId}`)],
            [Markup.button.callback('❌ Rad etish', `reject_${orderId}`)]
          ])
        });
      }
    } catch (e) {
      console.error("UserPhoto error:", e);
      await ctx.reply("❌ Xatolik yuz berdi.");
    }
  }

  // 4. ADMIN HARAKATI
  async handleAdminAction(ctx: any, action: string) {
    const callbackQuery = ctx.update.callback_query;
    if (!callbackQuery || !callbackQuery.data) return;

    const orderId = ctx.match[1];
    try {
      await this.ordersService.updateStatus(orderId, action);
      await ctx.answerCbQuery("Amal bajarildi ✅");
      
      const oldCaption = callbackQuery.message.caption || "";
      await ctx.editMessageCaption(oldCaption + `\n\n✅ <b>STATUS: ${action}</b>`, { 
        parse_mode: 'HTML' 
      });
    } catch (e) {
      await ctx.answerCbQuery("Xato: Buyurtma topilmadi");
    }
  }

  // 5. MIJOZGA XABAR YUBORISH
  async sendMessageToUser(telegramId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
    } catch (e) {
      console.log("Xabar yuborishda xato.");
    }
  }
}