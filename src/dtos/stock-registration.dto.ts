import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class StockRegistrationDto {
  @ApiProperty({ example: '2023-06-06' })
  @IsNotEmpty()
  @IsDateString()
  operation_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(5, 6)
  ticket: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tax: number;
}
