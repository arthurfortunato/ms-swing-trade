import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StockRegistrationDto } from 'src/dtos/stock-registration.dto';
import { StockPurchaseService } from 'src/services/stock-purchase.service';
import { StockSaleService } from 'src/services/stock-sale.service';
import { Response } from 'express';

@Controller('stock-registration')
export class StockRegistrationController {
  constructor(
    private stockPurchaseService: StockPurchaseService,
    private stockSaleService: StockSaleService,
  ) {}

  @Post('purchase')
  @UsePipes(ValidationPipe)
  async createStockPurchase(
    @Body() createPurchaseDto: StockRegistrationDto,
    @Res() res: Response,
  ) {
    await this.stockPurchaseService.createStockPurchase(createPurchaseDto);

    return res
      .status(HttpStatus.CREATED)
      .send({ message: 'Successful purchase!' });
  }

  @Post('sale')
  @UsePipes(ValidationPipe)
  async createStockSale(
    @Body() createStockSaleDto: StockRegistrationDto,
    @Res() res: Response,
  ) {
    await this.stockSaleService.createStockSale(createStockSaleDto);

    return res.status(HttpStatus.CREATED).send({ message: 'Successful sale!' });
  }

  @Get()
  async getAllRegistrations(@Res() res: Response) {
    const operations = await this.stockPurchaseService.getAllRegistrations();

    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('purchase')
  async getRegistrationsPurchase(@Res() res: Response) {
    const operations =
      await this.stockPurchaseService.getRegistrationsPurchase();

    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('sale')
  async getRegistrationsSale(@Res() res: Response) {
    const operations = await this.stockPurchaseService.getRegistrationsSale();

    return res.status(HttpStatus.OK).json(operations);
  }
}
