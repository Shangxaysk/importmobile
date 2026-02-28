import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ==========================================
  // 1. ENG MUHIM QATOR: Barcha yo'llar oldiga /api qo'shadi
  // ==========================================
  app.setGlobalPrefix('api');

  // 2. CORS sozlamalari
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Eskidan qolgan local rasmlar uchun yo'llar
  const uploadsPath = join(process.cwd(), 'uploads');
  
  // Frontend turli xil prefixlar bilan rasm so'rasa ham topib berishi uchun:
  app.use('/uploads', express.static(uploadsPath));
  app.use('/api/uploads', express.static(uploadsPath)); 
  app.use('/api/importmobile/uploads', express.static(uploadsPath)); // Ehtiyot sharti

  // 4. Validatsiya
  app.useGlobalPipes(new ValidationPipe());

  // 5. Serverni ishga tushirish
  await app.listen(process.env.PORT || 3000);
}
bootstrap();