import { Controller, Get, Post, Body } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';

@Controller('admin-settings')
export class GlobalSettingsController {
  constructor(private readonly service: GlobalSettingsService) {}

  @Get()
  async getSettings() {
    return this.service.getSettings();
  }

  @Post()
  async updateSettings(@Body() dto: { cardNumber: string; cardHolder: string }) {
    return this.service.updateSettings(dto);
  }
}