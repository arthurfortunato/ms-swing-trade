import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StockRegistrationDto } from 'src/dtos/stock-registration.dto';
import { StockRegistrationService } from 'src/services/stock-registration.service';
import { Response } from 'express';

@Controller('stock-registration')
export class StockRegistrationController {
  constructor(private stockRegistrationService: StockRegistrationService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createStock(
    @Body() createStockRegistrationDto: StockRegistrationDto,
    @Res() res: Response,
  ) {
    const stockRegistration = await this.stockRegistrationService.createStock(
      createStockRegistrationDto,
    );

    if (stockRegistration) {
      res.status(201).send({ message: 'Stock registered successfully!' });
    } else {
      res.status(404).send({ message: 'Bad Request' });
    }
  }
}
