import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // Tahrirlash paytida o'chirilmagan eski rasmlar ro'yxatini yuborish uchun
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  existingImages?: string[];
}