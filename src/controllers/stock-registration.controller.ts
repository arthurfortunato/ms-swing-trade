import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StockRegistrationDto } from '../dtos/stock-registration.dto';
import { StockPurchaseService } from '../services/stock-purchase.service';
import { StockSaleService } from '../services/stock-sale.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Purchase and Sale record')
@Controller('stock-registration')
export class StockRegistrationController {
  constructor(
    private stockPurchaseService: StockPurchaseService,
    private stockSaleService: StockSaleService,
  ) {}

  @Post('purchase')
  @UsePipes(ValidationPipe)
  async createStockPurchase(
    @Body() createPurchaseDto: StockRegistrationDto[] | StockRegistrationDto,
    @Res() res: Response,
  ) {
    if (Array.isArray(createPurchaseDto)) {
      for (const purchaseDto of createPurchaseDto) {
        await this.stockPurchaseService.createStockPurchase(purchaseDto);
      }
    } else {
      await this.stockPurchaseService.createStockPurchase(createPurchaseDto);
    }

    return res
      .status(HttpStatus.CREATED)
      .send({ message: 'Successful purchase(s)!' });
  }

  @Post('sale')
  @UsePipes(ValidationPipe)
  async createStockSale(
    @Body() createStockSaleDto: StockRegistrationDto[] | StockRegistrationDto,
    @Res() res: Response,
  ) {
    if (Array.isArray(createStockSaleDto)) {
      for (const saleDto of createStockSaleDto) {
        await this.stockSaleService.createStockSale(saleDto);
      }
    } else {
      await this.stockSaleService.createStockSale(createStockSaleDto);
    }

    return res
      .status(HttpStatus.CREATED)
      .send({ message: 'Successful sale(s)!' });
  }

  @Get()
  async getAllRegistrations(@Res() res: Response) {
    const operations = await this.stockPurchaseService.getAllRegistrations();

    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('ticket/:ticket')
  async getRegistrationsByTicket(
    @Res() res: Response,
    @Param('ticket') ticket: string,
  ) {
    const operations = await this.stockPurchaseService.getRegistrationsByTicket(
      ticket,
    );

    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('purchase')
  async getRegistrationsPurchase(@Res() res: Response) {
    const operations =
      await this.stockPurchaseService.getRegistrationsPurchase();

    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('purchase-active')
  async getRegistrationsPurchaseActive(@Res() res: Response) {
    const operations =
      await this.stockPurchaseService.getRegistrationsPurchaseActive();

    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('sale')
  async getRegistrationsSale(@Res() res: Response) {
    const operations = await this.stockPurchaseService.getRegistrationsSale();

    return res.status(HttpStatus.OK).json(operations);
  }
}
