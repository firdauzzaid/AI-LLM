import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ContactChannel } from '@prisma/client';

export class CreateLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerName?: string;

  @IsEnum(ContactChannel)
  contactChannel!: ContactChannel;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}
