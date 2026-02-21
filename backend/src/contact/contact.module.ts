import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config'; // <--- BU QATORNI QO'SHING

@Module({
  imports: [
    ConfigModule, // <--- VA BU YERDA HAM KO'RSATING
  ],
  controllers: [ContactController],
  providers: [ContactService, PrismaService],
  exports: [ContactService],
})
export class ContactModule {}