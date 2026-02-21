import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    // 1. Foydalanuvchi borligi va paroli to'g'riligini tekshiramiz
    const user = await this.authService.validateUser(body.phone, body.password);
    
    if (!user) {
      throw new UnauthorizedException('Telefon raqam yoki parol xato!');
    }

    // 2. Tekshiruvdan o'tgan user obyektini login funksiyasiga beramiz
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    // Frontenddan kelayotgan ism "fullName" yoki "name" bo'lishi mumkin. 
    // 3. telegramId ni ham AuthService-ga jo'natamiz
    return this.authService.register(
      body.fullName || body.name, 
      body.phone, 
      body.password,
      body.telegramId // <--- MANA SHU QO'SHILDI
    );
  }
}