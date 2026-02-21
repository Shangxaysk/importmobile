import { IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  message: string;

  @IsOptional()
  type?: string; // 'suggestion' yoki 'complaint'
}