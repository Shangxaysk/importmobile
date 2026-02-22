import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @Type(() => Number) // Stringni raqamga aylantiradi
  productId: number;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsString()
  config?: string;
}

export class CreateOrderDto {
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
  paymentReceipt: string; // ImgBB dan kelgan URL

  @IsNumber()
  @Type(() => Number)
  totalPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // Passport ma'lumotlari (Faqat Bot uchun)
  @IsString()
  passportSeria: string;

  @IsString()
  passportNumber: string;

  @IsString()
  passportPinfl: string;
}