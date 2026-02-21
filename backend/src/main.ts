import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. CORSNI YOQISH (Eng tepada bo'lsin)
  app.enableCors({
    origin: '*', // Hamma joydan ruxsat berish
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  // 2. KEYIN SERVERNI ESHITISH
  await app.listen(3000);
}
bootstrap();
