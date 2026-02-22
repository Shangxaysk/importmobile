import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, imagePath: string) {
    return this.prisma.banner.create({
      data: {
        image: imagePath, // Endi bu https://i.ibb.co/... linki
        title: dto.title,
        linkType: dto.linkType,
        linkValue: dto.linkValue,
        badgeText: dto.badgeText,
        badgeColor: dto.badgeColor,
        badgeTextColor: dto.badgeTextColor,
        badgePosition: dto.badgePosition,
        isActive: String(dto.isActive) === 'true',
      },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner #${id} topilmadi`);

    // ImgBB dagi rasmni API orqali o'chirish shart emas (bepul tarifda joy cheksiz)
    return this.prisma.banner.delete({ where: { id } });
  }

  async toggleActive(id: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException("Banner topilmadi");

    return this.prisma.banner.update({
      where: { id },
      data: { isActive: !banner.isActive },
    });
  }
}
