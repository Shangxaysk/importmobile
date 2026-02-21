import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { AuthModule } from '../auth/auth.module'; // <--- 1. IMPORT QILING

@Module({
  imports: [
    AuthModule // <--- 2. BU YERGA QO'SHING
  ],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
