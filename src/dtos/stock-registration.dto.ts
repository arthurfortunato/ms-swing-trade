import { IsNotEmpty } from 'class-validator';
import { TypeStock } from 'src/enums/type-stock.enum';

export class StockRegistrationDto {
  @IsNotEmpty()
  type: TypeStock;

  @IsNotEmpty()
  operation_date: Date;

  @IsNotEmpty()
  ticket: string;

  @IsNotEmpty()
  value: number;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  tax: number;

  @IsNotEmpty()
  total_operation: number;
}
