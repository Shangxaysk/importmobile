import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, imagePath: string | null) {
    return this.prisma.category.create({
      data: {
        nameUz: dto.nameUz,
        nameRu: dto.nameRu || dto.nameUz,
        image: imagePath,
        icon: dto.icon,
        hasSpecs: dto.hasSpecs === true || dto.hasSpecs === 'true',
        parentId: dto.parentId ? Number(dto.parentId) : null,
      },
    });
  }

  // TO'G'IRLANGAN: Faqat asosiy kataloglarni ierarxiya bilan qaytaradi
 async findAll() {
    return this.prisma.category.findMany({
      // DIQQAT: where: { parentId: null } ni OLIB TASHLADIK!
      include: {
        parent: true,   // O'zining otasi kimligini bilish uchun
        products: { select: { id: true } },
        children: {
          include: { products: { select: { id: true } } }
        }
      },
      orderBy: { id: 'asc' }
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true, products: true },
    });
    if (!category) throw new NotFoundException('Katalog topilmadi');
    return category;
  }

  async update(id: number, dto: any, imagePath?: string) {
    const data: any = {
      nameUz: dto.nameUz,
      nameRu: dto.nameRu,
      hasSpecs: dto.hasSpecs === true || dto.hasSpecs === 'true',
      parentId: dto.parentId ? Number(dto.parentId) : null,
      icon: dto.icon
    };
    if (imagePath) data.image = imagePath;

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}