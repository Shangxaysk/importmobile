import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // Qo'shildi
import { join } from 'path'; // Qo'shildi

async function bootstrap() {
  // <NestExpressApplication> turini qo'shish shart
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 1. CORSNI YOQISH
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. RASMLARNI OCHIB BERISH (Static Assets)
  // Bu qator brauzerga /uploads/ bilan boshlanadigan so'rovlarni 
  // serverdagi 'uploads' papkasidan qidirishni aytadi
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe());

  // 3. SERVERNI ESHITISH
  await app.listen(process.env.PORT || 3000); // Render uchun portni dinamik qildik
}
bootstrap();