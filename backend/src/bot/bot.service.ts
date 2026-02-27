import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectBot, Start, Hears, On, Ctx, Update } from 'nestjs-telegraf';
import { Context, Telegraf, Markup } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { UploadService } from '../upload/upload.service'; 
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Update() // 👈 MUHIM: NestJS botni taniy olishi uchun shart!
@Injectable()
export class BotService {
  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    private prisma: PrismaService,
    private configService: ConfigService,
    private uploadService: UploadService, 
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {
    // Admin harakatlarini (Inline buttons) constructor'da ro'yxatdan o'tkazamiz
    this.bot.action(/^approve_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'APPROVE'));
    this.bot.action(/^fraud_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_FRAUD'));
    this.bot.action(/^wrong_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_WRONG_IMAGE'));
    this.bot.action(/^reject_(.+)$/, (ctx) => this.handleAdminAction(ctx, 'REJECT_OTHER'));
  }

  // ==========================================
  // START VA ASOSIY MENYULAR
  // ==========================================

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const userName = ctx.from?.first_name || 'Hurmatli mijoz';
    const webAppUrl = this.configService.get<string>('WEB_APP_URL') || 'https://importmobile.uz'; 

    const welcomeMessage = `Assalomu alaykum, <b>${userName}</b>! 🚀\n\nBizning ImportMobile internet do'konimizga xush kelibsiz. Tugma orqali ilovaga o'tib, xaridlarni boshlashingiz mumkin.\n\n---\n\nЗдравствуйте, <b>${userName}</b>! 🚀\n\nДобро пожаловать в интернет-магазин ImportMobile. Нажмите кнопку ниже, чтобы начать покупки.`;

    await ctx.replyWithHTML(
      welcomeMessage,
      Markup.inlineKeyboard([
        [Markup.button.webApp("📱 Do'konga kirish / Войти в магазин", webAppUrl)]
      ])
    );

    await ctx.reply(
      "Yoki pastdagi menyulardan foydalaning 👇",
      Markup.keyboard([
        ["📦 Mening buyurtmalarim", "ℹ️ Yordam va Aloqa"]
      ]).resize() 
    );
  }

  @Hears("📦 Mening buyurtmalarim")
  async onMyOrders(@Ctx() ctx: Context) {
    const webAppUrl = this.configService.get<string>('WEB_APP_URL') || 'https://importmobile.uz'; 

    await ctx.reply(
      "Buyurtmalaringiz holatini va tarixini ko'rish uchun quyidagi tugma orqali profilingizga kiring:",
      Markup.inlineKeyboard([
        [Markup.button.webApp("📦 Buyurtmalarni ko'rish", `${webAppUrl}/my-orders`)]
      ])
    );
  }

  @Hears("ℹ️ Yordam va Aloqa")
  async onHelp(@Ctx() ctx: Context) {
    const adminContact = this.configService.get<string>('ADMIN_USERNAME') || '@admin_username';
    const phone = this.configService.get<string>('CONTACT_PHONE') || '+998 90 123 45 67';

    const helpMsg = `☎️ <b>Biz bilan bog'lanish:</b>\n\n👨‍💻 Administrator: ${adminContact}\n📞 Telefon: <code>${phone}</code>\n\nSavollaringiz yoki takliflaringiz bo'lsa, bemalol murojaat qilishingiz mumkin!`;
    
    await ctx.replyWithHTML(helpMsg);
  }

  // Har qanday matn yozilganda
  @On('text')
  async onAnyText(@Ctx() ctx: Context) {
    // Agar gruppa ichida bo'lsa javob bermaymiz
    if (ctx.chat?.type !== 'private') return;

    const webAppUrl = this.configService.get<string>('WEB_APP_URL') || 'https://importmobile.uz'; 
    
    await ctx.reply(
      "Men faqat buyurtmalarni avtomatik qabul qiluvchi va holatini bildiruvchi botman 🤖.\n\nXarid qilish uchun do'konga kiring:",
      Markup.inlineKeyboard([
        [Markup.button.webApp("📱 Do'konga kirish", webAppUrl)]
      ])
    );
  }

  // ==========================================
  // S3 YUKLASH VA RASM (PHOTO) HANDLER
  // ==========================================

  private async uploadToS3(fileId: string): Promise<string> {
    try {
      const fileLink = await this.bot.telegram.getFileLink(fileId);
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      const pseudoFile = {
        buffer: buffer,
        originalname: `receipt_${Date.now()}.jpg`,
        mimetype: 'image/jpeg',
        size: buffer.length,
      } as any;

      const uploadResult = await this.uploadService.uploadFile(pseudoFile);
      return uploadResult.secure_url; 
    } catch (e) {
      console.error("S3 ga yuklashda xato (Bot):", e);
      throw new Error("Rasm yuklanmadi");
    }
  }

  @On('photo')
  async handleUserPhoto(@Ctx() ctx: Context) {
    const message = (ctx.message as any);
    
    // Agar rasm reply (javob) qilinmagan bo'lsa, shunchaki xush kelibsiz deymiz
    if (!message || !message.reply_to_message) {
      return this.onAnyText(ctx);
    }

    const replyText = message.reply_to_message.text || message.reply_to_message.caption || "";
    const orderIdMatch = replyText.match(/#IMPRT\d+/);
    if (!orderIdMatch) return;

    const orderId = orderIdMatch[0];
    const fileId = message.photo[message.photo.length - 1].file_id;
    const groupId = this.configService.get<string>('TELEGRAM_GROUP_ID') || '';
    const topicId = this.configService.get<string>('TELEGRAM_TOPIC_ORDERS') || '0';

    try {
      const waitMsg = await ctx.reply("⌛️ <b>Chek bulutli xotiraga yuklanmoqda...</b>", { parse_mode: 'HTML' });
      
      const newImageUrl = await this.uploadToS3(fileId);
      
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentReceipt: newImageUrl,
          status: 'NEW',
          isMessageRead: true 
        },
        include: { user: true }
      });

      await ctx.deleteMessage(waitMsg.message_id);
      await ctx.reply(`✅ <b>Muvaffaqiyatli!</b>\n\n${orderId} cheki yangilandi va adminga yuborildi.`, { parse_mode: 'HTML' });
      
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
      await ctx.reply("❌ Rasm yuklashda xatolik yuz berdi.");
    }
  }

  // ==========================================
  // ADMIN VA BUYURTMA BILDIRISHNOMALARI
  // ==========================================

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

  async handleAdminAction(ctx: any, action: string) {
    const orderId = ctx.match[1];
    try {
      await this.ordersService.updateStatus(orderId, action);
      await ctx.answerCbQuery("Bajarildi ✅");
      const oldCaption = ctx.update.callback_query.message.caption || "";
      await ctx.editMessageCaption(oldCaption + `\n\n✅ <b>STATUS: ${action}</b>`, { parse_mode: 'HTML' });
    } catch (e) {
      await ctx.answerCbQuery("Xato yuz berdi!");
    }
  }

  async sendMessageToUser(telegramId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
    } catch (e) {}
  }
}