import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CORS sozlamalari
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Eskidan qolgan local rasmlar uchun (uploads papkasi bo'lsa)
  const uploadsPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath)); 

  app.useGlobalPipes(new ValidationPipe());
  
  // Port Render muhitiga moslandi
  await app.listen(process.env.PORT || 3000);
}
bootstrap();