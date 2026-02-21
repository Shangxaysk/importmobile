import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto'; // Agar sizda bo'lsa
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 1. Yangi user yaratish (Auth uchun)
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  // 2. Telefoni bo'yicha topish (Login uchun)
  async findOne(phoneNumber: string) {
    return this.prisma.user.findUnique({ where: { phoneNumber } });
  }

  // 3. ID bo'yicha topish
  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // --- ADMIN UCHUN YANGI FUNKSIYALAR ---

  // 4. Hamma userlarni olish
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'desc' }, // Eng yangilari tepada
      include: { 
        orders: { // Userning nechta buyurtmasi borligini bilish uchun
          select: { id: true, status: true } 
        } 
      }
    });
  }

  // 5. Bloklash / Blokdan ochish
  async toggleBlock(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked }, // Teskarisiga o'girish (True -> False)
    });
  }
}