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

  // ImgBB dan keladigan rasm URL'lari massivi uchun
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Massiv ichidagi har bir element string bo'lishi kerak
  images?: string[];

  // FormData string formatida yuborgani uchun any qoldiramiz
  @IsOptional()
  specifications?: any;
}