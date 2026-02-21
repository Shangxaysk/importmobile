import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GlobalSettingsService {
  constructor(private prisma: PrismaService) {}

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
}