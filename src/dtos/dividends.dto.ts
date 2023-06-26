import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class DividendsDto {
  @ApiProperty({ example: '2023-06-06' })
  @IsNotEmpty()
  @IsDateString()
  payment_date: Date;

  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(5, 6)
  ticket: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  rate: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
