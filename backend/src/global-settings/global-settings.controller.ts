import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
// import { RolesGuard } from '../auth/roles.guard'; <-- Kerak bo'lsa yoqib qo'yasiz

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

  // YANGI YO'LAKCHA (Kodni shu yerga qo'shdik)
  @Patch('toggle-orders')
  async toggleOrders(@Body() body: { isOrdersEnabled: boolean, restModeMessage: string }) {
    return this.service.toggleOrders(body);
  }
}