import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || null,
        deliveryTime: data.deliveryTime,
        prepaymentPercent: data.prepaymentPercent,
        images: data.images, // ImgBB URL'lar massivi
        specifications: data.specifications || {},
        category: {
          connect: { id: data.categoryId }
        }
      },
      include: { category: true }
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    return product;
  }

  async update(id: number, dto: any, newImages: string[]) {
    const existingProduct = await this.findOne(id);

    let finalSpecs = dto.specifications;
    if (typeof dto.specifications === 'string') {
      try { finalSpecs = JSON.parse(dto.specifications); } catch (e) { finalSpecs = existingProduct.specifications; }
    }

    // Rasmlarni birlashtirish mantiqi
    let currentImages: string[] = [];
    if (dto.existingImages) {
      currentImages = typeof dto.existingImages === 'string' 
        ? JSON.parse(dto.existingImages) 
        : dto.existingImages;
    } else {
      currentImages = existingProduct.images;
    }

    const finalImages = [...currentImages, ...newImages];

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
        ...(dto.categoryId && {
          category: { connect: { id: Number(dto.categoryId) } }
        })
      },
      include: { category: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}