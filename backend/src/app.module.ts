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
import { BotModule } from './bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { UsersModule } from './users/users.module';
import { BannersModule } from './banners/banners.module';
import { ContactModule } from './contact/contact.module';
import { ConfigModule } from '@nestjs/config'; // <--- Import bor
import { SettingsModule } from './settings/settings.module';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // 1. ConfigModule birinchi bo'lib Global sifatida yuklanishi shart!
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN || '',
    }),
    
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads', 
    }),

    ProductsModule, 
    AuthModule, 
    UploadModule, // Controller va Service'lar shuning ichida bo'lishi kerak
    CategoriesModule, 
    NewsModule, 
    OrdersModule, 
    BotModule, 
    UsersModule, 
    BannersModule, 
    ContactModule, 
    GlobalSettingsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}