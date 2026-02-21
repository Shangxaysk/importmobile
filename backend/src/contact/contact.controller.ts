import { 
  Controller, 
  Post, 
  Get,
  Body, 
  UseInterceptors, 
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // 1. Shikoyat va takliflar yuborish (Topic 2)
  @Post('suggestion')
  @UseInterceptors(FileInterceptor('file'))
  sendSuggestion(@Body() dto: any, @UploadedFile() file: Express.Multer.File) {
    return this.contactService.sendToTelegram(dto, file, 'SUGGESTION');
  }

  // 2. Mahsulot qidirish so'rovi (Topic 5)
  @Post('product-search')
  @UseInterceptors(FileInterceptor('file'))
  sendSearch(@Body() dto: any, @UploadedFile() file: Express.Multer.File) {
    return this.contactService.sendToTelegram(dto, file, 'SEARCH');
  }

  // 3. Biz bilan aloqa ma'lumotlarini bazadan olish
  @Get('settings')
  getSettings() {
    return this.contactService.getSettings();
  }

  // 4. Biz bilan aloqa ma'lumotlarini yangilash (Admin uchun)
  @Post('settings')
  updateSettings(@Body() dto: any) {
    return this.contactService.updateSettings(dto);
  }
}