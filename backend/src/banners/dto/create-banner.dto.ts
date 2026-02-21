import { IsString, IsOptional, IsBoolean, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumberString() // Form-data orqali raqamlar string bo'lib keladi
  productId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true') // String "true" ni Boolean true ga aylantiramiz
  @IsBoolean()
  isActive?: boolean;
}