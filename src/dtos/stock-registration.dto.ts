import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class StockRegistrationDto {
  @IsNotEmpty()
  @IsDateString()
  operation_date: Date;

  @IsNotEmpty()
  @IsString()
  @Length(5, 6)
  ticket: string;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  tax: number;
}
