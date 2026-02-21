import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.news.create({ data });
  }

  findAll() {
    return this.prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: number) {
    // Ko'rishlar sonini oshirish (+1 view)
    return this.prisma.news.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  update(id: number, data: any) {
    return this.prisma.news.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.news.delete({ where: { id } });
  }
}