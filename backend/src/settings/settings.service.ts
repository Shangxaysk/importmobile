import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getContactSettings() {
    let settings = await this.prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.systemSettings.create({ data: {} });
    }
    return settings;
  }

  async updateContactSettings(dto: any) {
    const settings = await this.getContactSettings();
    return this.prisma.systemSettings.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}