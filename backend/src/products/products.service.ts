import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 1. MAHSULOT YARATISH
  async create(data: any) {
    // specifications allaqachon controllerda parse qilingan bo'lishi kerak, 
    // lekin ehtiyot shart yana bir bor tekshiramiz
    const parsedSpecs = typeof data.specifications === 'string' 
      ? JSON.parse(data.specifications) 
      : data.specifications;

    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        deliveryTime: data.deliveryTime,
        prepaymentPercent: Number(data.prepaymentPercent || 0),
        images: data.images,
        specifications: parsedSpecs || {}, // NULL bo'lmasligi uchun bo'sh obyekt
        category: {
          connect: { id: Number(data.categoryId) }
        }
      },
      include: { category: true }
    });
  }

  // 2. HAMMA MAHSULOTLARNI OLISH
  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. BITTA MAHSULOTNI OLISH
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    return product;
  }

  // 4. TAHRIRLASH (UPDATE)
  async update(id: number, dto: any, newImages: string[]) {
    const existingProduct = await this.findOne(id);

    // 1. Specifications mantiqi
    let finalSpecs = dto.specifications;
    if (typeof dto.specifications === 'string') {
      try {
        finalSpecs = JSON.parse(dto.specifications);
      } catch (e) {
        finalSpecs = existingProduct.specifications;
      }
    }

    // 2. Rasmlar mantiqi
    let currentImages: string[] = [];
    if (dto.existingImages) {
      currentImages = typeof dto.existingImages === 'string' 
        ? JSON.parse(dto.existingImages) 
        : dto.existingImages;
    } else {
      currentImages = existingProduct.images;
    }

    const finalImages = [...currentImages, ...newImages];

    // 3. Bazaga yuborish
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price ? Number(dto.price) : undefined,
        originalPrice: dto.originalPrice ? Number(dto.originalPrice) : null,
        deliveryTime: dto.deliveryTime,
        prepaymentPercent: dto.prepaymentPercent ? Number(dto.prepaymentPercent) : undefined,
        specifications: finalSpecs,
        images: finalImages,
        // Agar kategoriya o'zgargan bo'lsa
        ...(dto.categoryId && {
          category: { connect: { id: Number(dto.categoryId) } }
        })
      },
      include: { category: true }
    });
  }

  // 5. O'CHIRISH
  async remove(id: number) {
    await this.findOne(id); // Borligini tekshirish
    return this.prisma.product.delete({
      where: { id },
    });
  }
}