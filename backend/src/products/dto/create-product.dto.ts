import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  originalPrice?: number;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  prepaymentPercent?: number;

  // MUHIM: Bu yerda qattiq @IsObject qo'ymaymiz, 
  // chunki FormData uni string sifatida olib keladi.
  @IsOptional()
  specifications?: any;
}