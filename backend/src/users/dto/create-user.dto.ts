import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: "Ism matn ko'rinishida bo'lishi kerak" })
  @IsNotEmpty({ message: "Ism-familiya bo'sh bo'lmasligi kerak" })
  fullName: string;

  @IsString({ message: "Telefon raqami noto'g'ri" })
  @IsNotEmpty({ message: "Telefon raqami kiritilishi shart" })
  phoneNumber: string;

  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;

  @IsOptional()
  @IsString()
  role?: string; // 'ADMIN' yoki 'USER' (ixtiyoriy)

  @IsOptional()
  telegramId?: string; // Telegram bot bilan bog'lash uchun
}