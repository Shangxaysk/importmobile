import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  config?: string; // Rang, Xotira
}

export class CreateOrderDto {
  // --- ORDER MA'LUMOTLARI (Bazaga yoziladi) ---
  @IsString()
  address: string;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsString()
  extraPhone?: string;

  @IsOptional()
  @IsString()
  telegramUser?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsString()
  paymentReceipt: string; // Rasm URL

  @IsNumber()
  totalPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // --- XAVFSIZLIK: PASSPORT MA'LUMOTLARI (Bazaga YOZILMAYDI) ---
  // Bular faqat Controller orqali o'tadi va Botga ketadi
  @IsString()
  passportSeria: string; // AA

  @IsString()
  passportNumber: string; // 1234567

  @IsString()
  passportPinfl: string; // 14 ta raqam
}