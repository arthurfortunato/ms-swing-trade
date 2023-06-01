import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
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

  @Post('purchase')
  @UsePipes(ValidationPipe)
  async createStockPurchase(
    @Body() createStockRegistrationDto: StockRegistrationDto,
    @Res() res: Response,
  ) {
    try {
      const stockPurchase =
        await this.stockRegistrationService.createStockPurchase(
          createStockRegistrationDto,
        );

      if (stockPurchase) {
        return res
          .status(201)
          .send({ message: 'Stock registered successfully!' });
      } else {
        return res.status(404).send({ message: 'Bad Request' });
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sale')
  @UsePipes(ValidationPipe)
  async createStockSale(
    @Body() createStockRegistrationDto: StockRegistrationDto,
    @Res() res: Response,
  ) {
    try {
      const stockPurchase = await this.stockRegistrationService.createStockSale(
        createStockRegistrationDto,
      );

      if (stockPurchase) {
        return res
          .status(201)
          .send({ message: 'Stock registered successfully!' });
      } else {
        return res.status(404).send({ message: 'Bad Request' });
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
