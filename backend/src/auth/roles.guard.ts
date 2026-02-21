import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Controller tepasidagi @Roles('ADMIN') ni o'qiymiz
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Agar rol talab qilinmasa, ruxsat beramiz
    if (!requiredRoles) {
      return true;
    }

    // 2. Requestdagi userni olamiz (JwtStrategy dan keladi)
    const { user } = context.switchToHttp().getRequest();

    console.log("RolesGuard Tekshiruvi -> User:", user); // <-- KONSOLDA TEKSHIRISH UCHUN

    // 3. User roli talab qilingan rollardan biriga mos kelishini tekshiramiz
    return requiredRoles.some((role) => user?.role?.includes(role));
  }
}