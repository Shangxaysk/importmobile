import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GlobalSettingsService {
  constructor(private prisma: PrismaService) {}

  // Barcha sozlamalarni (Karta + Tizim holati) bittada qaytaradi
  async getSettings() {
    let settings = await this.prisma.globalSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await this.prisma.globalSettings.create({
        data: { id: 1, cardNumber: '', cardHolder: '' },
      });
    }
    return settings;
  }

  async updateSettings(dto: { cardNumber: string; cardHolder: string }) {
    return this.prisma.globalSettings.upsert({
      where: { id: 1 },
      update: {
        cardNumber: dto.cardNumber,
        cardHolder: dto.cardHolder,
      },
      create: {
        id: 1,
        cardNumber: dto.cardNumber,
        cardHolder: dto.cardHolder,
      },
    });
  }

  // Tizim holatini o'zgartirish
  async toggleOrders(data: { isOrdersEnabled: boolean; restModeMessage: string }) {
    return this.prisma.globalSettings.upsert({
      where: { id: 1 },
      update: { 
        isOrdersEnabled: data.isOrdersEnabled,
        restModeMessage: data.restModeMessage
      },
      create: {
        id: 1,
        isOrdersEnabled: data.isOrdersEnabled,
        restModeMessage: data.restModeMessage,
        cardNumber: '',
        cardHolder: ''
      }
    });
  }
}