import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('contact')
  getContact() {
    return this.settingsService.getContactSettings();
  }

  @Post('contact')
  @UseGuards(RolesGuard)
  updateContact(@Body() dto: any) {
    return this.settingsService.updateContactSettings(dto);
  }
}