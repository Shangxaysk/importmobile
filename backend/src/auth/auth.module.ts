import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // <-- Prisma Moduli
import { RolesGuard } from './roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { JwtStrategy } from './jwt.strategy'
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // <--- BU SHART
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy], // <--- JwtStrategy bu yerda bo'lishi shart
  exports: [AuthService, PassportModule, JwtStrategy, JwtModule], // <--- AuthService va PassportModule ni export qilamiz
})
export class AuthModule {}