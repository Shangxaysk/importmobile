import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  // 1. BANNER YARATISH (Yangi sistemaga moslandi)
 async create(dto: any, imagePath: string) {
  return this.prisma.banner.create({
    data: {
      image: imagePath,
      title: dto.title,
      linkType: dto.linkType,
      linkValue: dto.linkValue,
      badgeText: dto.badgeText,
      badgeColor: dto.badgeColor,
      badgeTextColor: dto.badgeTextColor,
      badgePosition: dto.badgePosition,
      isActive: dto.isActive === 'true',
    },
  });
  }

  // 2. HAMMASINI OLISH
  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. O'CHIRISH (Rasm fayli bilan birga)
  async remove(id: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    
    if (!banner) {
      throw new NotFoundException(`Banner #${id} topilmadi`);
    }

    // Faylni o'chirish logikasi
    if (banner.image && banner.image.includes('uploads')) {
      try {
        const fileName = banner.image.split('/').pop();
        if (fileName) {
          const filePath = path.join(process.cwd(), 'uploads', fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (err) {
        console.error("Faylni o'chirishda xato:", err);
      }
    }

    return this.prisma.banner.delete({ where: { id } });
  }

  // 4. STATUSNI O'ZGARTIRISH
  async toggleActive(id: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException("Banner topilmadi");

    return this.prisma.banner.update({
      where: { id },
      data: { isActive: !banner.isActive },
    });
  }
}