import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    console.log("Token Payload:", payload); // <-- Konsolga chiqarib ko'ramiz

    // MUHIM: Token ichida ID "sub" yoki "id" bo'lib kelishi mumkin.
    // Biz ikkalasini ham tekshiramiz.
    return { 
        id: payload.sub || payload.id, // <--- MANA SHU YER O'ZGARTIRILDI
        phone: payload.phone || payload.phoneNumber, 
        role: payload.role 
    };
  }
}