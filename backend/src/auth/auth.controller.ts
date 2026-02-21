import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.phone, body.password);
    
    if (!user) {
      throw new UnauthorizedException('Telefon raqam yoki parol xato!');
    }

    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(
      body.fullName || body.name, 
      body.phone, 
      body.password,
      body.telegramId 
    );
  }

  // TELEGRAM ORQALI AVTOMATIK KIRISH UCHUN (YANGI QO'SHILDI)
  @Post('telegram-login')
  async telegramLogin(@Body() body: { telegramId: string }) {
    const result = await this.authService.loginWithTelegram(body.telegramId);
    if (!result) {
      throw new UnauthorizedException('Bunday Telegram ID bazada yo\'q');
    }
    return result;
  }
}