import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // 1. REGISTRATSIYA METODI
  async register(fullName: string, phone: string, pass: string) {
    // Telefon raqami bandligini tekshiramiz
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber: phone }
    });

    if (existingUser) {
      throw new ConflictException('Bu telefon raqami allaqachon ro\'yxatdan o\'tgan!');
    }

    // Parolni shifrlaymiz
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Bazaga saqlaymiz
    const user = await this.prisma.user.create({
      data: {
        fullName: fullName,
        phoneNumber: phone,
        password: hashedPassword,
        role: 'USER', // Yangi foydalanuvchilar har doim USER bo'ladi
      },
    });

    // Ro'yxatdan o'tgach srazu login qilib, token yuboramiz
    return this.login(user);
  }

  // 2. FOYDALANUVCHINI TEKSHIRISH (LOGIN UCHUN)
  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ 
      where: { phoneNumber: phone } 
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null; 
  }

  // 3. LOGIN (TOKEN YARATISH)
  async login(user: any) {
    // Payload ichiga Frontend va Guard uchun kerakli ma'lumotlarni solamiz
    const payload = { 
      sub: user.id, 
      phone: user.phoneNumber, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phoneNumber,
        role: user.role
      }
    };
  }
}