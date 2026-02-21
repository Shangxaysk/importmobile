import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service'; // Prisma yo'lini tekshiring
import axios from 'axios';

// Node.js uchun FormData kutubxonasi
const FormData = require('form-data'); 

@Injectable()
export class ContactService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService, // Prisma qo'shildi
  ) {}

  // --- 1. TELEGRAMGA YUBORISH (Suggestion yoki Search) ---
  async sendToTelegram(dto: { message: string }, file: Express.Multer.File, type: 'SUGGESTION' | 'SEARCH') {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const groupId = this.configService.get<string>('TELEGRAM_GROUP_ID');
    
    // Turiga qarab .env dan Topic ID larni olamiz
    const topicId = type === 'SEARCH' 
      ? this.configService.get<string>('TELEGRAM_TOPIC_SEARCH') // Masalan: 5
      : this.configService.get<string>('TELEGRAM_TOPIC_SUGGESTIONS'); // Masalan: 2

    const formData = new FormData();
    formData.append('chat_id', groupId);
    formData.append('message_thread_id', Number(topicId));
    formData.append('parse_mode', 'HTML');

    // Sarlavhani turiga qarab belgilaymiz
    const title = type === 'SEARCH' ? "🔍 <b>MAHSULOT QIDIRUVI</b>" : "📩 <b>YANGI TAKLIF/SHIKOYAT</b>";

    const caption = `
${title}

📝 <b>Xabar:</b>
<blockquote><b>${dto.message || "Matnsiz"}</b></blockquote>

📅 <b>Vaqt:</b> <code>${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}</code>
`;

    try {
      if (file) {
        formData.append('document', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        formData.append('caption', caption);
        await axios.post(`https://api.telegram.org/bot${botToken}/sendDocument`, formData, {
          headers: formData.getHeaders(),
        });
      } else {
        formData.append('text', caption);
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, formData, {
          headers: formData.getHeaders(),
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Telegram API xatosi:', error.response?.data || error.message);
      throw new HttpException('Xabar yuborishda xatolik', HttpStatus.BAD_GATEWAY);
    }
  }

  // --- 2. ADMIN SOZLAMALARI (SystemSettings) ---
  async getSettings() {
    let settings = await this.prisma.systemSettings.findFirst();
    if (!settings) {
      // Agar bazada hali yo'q bo'lsa, birinchi marta yaratib qo'yamiz
      settings = await this.prisma.systemSettings.create({
        data: {
          phone: '+998 90 123 45 67',
          telegram: '@importmobile_admin',
          email: 'info@importmobile.uz',
          address: 'Toshkent sh.'
        }
      });
    }
    return settings;
  }

  async updateSettings(dto: any) {
    const settings = await this.getSettings();
    return this.prisma.systemSettings.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}