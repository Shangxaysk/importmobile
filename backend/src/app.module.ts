import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static'; 
import { join } from 'path';
import { CategoriesModule } from './categories/categories.module';
import { NewsModule } from './news/news.module';
import { OrdersModule } from './orders/orders.module';
import { UploadController } from './upload/upload.controller';
import { BotModule } from './bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { UsersModule } from './users/users.module';
import { BannersModule } from './banners/banners.module';
import { ContactModule } from './contact/contact.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { SettingsModule } from './settings/settings.module';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN || '', // .env dan oladi
    }),
    ProductsModule, 
    AuthModule, 
    // --- O'ZGARISH SHU YERDA ---
    ServeStaticModule.forRoot({
      // __dirname o'rniga process.cwd() ishlatamiz. 
      // Bu loyihaning eng asosiy papkasidagi 'uploads'ni to'g'ri topadi.
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads', 
    }), 
    // ---------------------------
    CategoriesModule, 
    NewsModule, 
    OrdersModule, BotModule, UsersModule, BannersModule, ContactModule, GlobalSettingsModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, PrismaService, UploadService],
})
export class AppModule {}