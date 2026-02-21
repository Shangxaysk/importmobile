import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { RolesGuard } from '../auth/roles.guard'; // Sizdagi Guard nomi

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('contact')
  getContact() {
    return this.settingsService.getContactSettings();
  }

  @Post('contact')
  @UseGuards(RolesGuard) // Faqat login qilganlar (Admin) uchun
  updateContact(@Body() dto: any) {
    return this.settingsService.updateContactSettings(dto);
  }
}