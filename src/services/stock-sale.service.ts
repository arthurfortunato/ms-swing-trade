import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockRegistrationDto } from 'src/dtos/stock-registration.dto';
import { Repository } from 'typeorm';
import { StockRegistration } from '../entities/stock-registration.entity';
import { TypeStock } from 'src/enums/type-stock.enum';
import { Purchase } from 'src/entities/purchase.entity';
import { Sale } from 'src/entities/sale.entity';
import { AppError } from 'src/error/AppError';
import { Operations } from 'src/entities/operations.entity';

const IRRF_RATE = 0.00005;

@Injectable()
export class StockSaleService {
  private readonly logger = new Logger(StockSaleService.name);

  constructor(
    @InjectRepository(StockRegistration)
    private stockRegistrationRepository: Repository<StockRegistration>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Operations)
    private operationsRepository: Repository<Operations>,
  ) {}

  async createStockSale(stockDto: StockRegistrationDto) {
    this.logger.log('Starting registered stock sale');

    const { ticket, quantity } = stockDto;
    let quantityToSell = quantity;
    let quantityExecuted = 0;
    let taxCharged = false;

    while (quantityToSell > 0) {
      this.logger.log(
        'Checking if there is a corresponding purchase with the ticket',
      );

      const correspondingPurchase = await this.getCorrespondingPurchase(ticket);

      if (correspondingPurchase) {
        const quantitySold = Math.min(
          correspondingPurchase.quantity,
          quantityToSell,
        );

        correspondingPurchase.quantity -= quantitySold;

        if (correspondingPurchase.quantity === 0) {
          correspondingPurchase.status = 'CLOSE';
        }

        const sale = this.createSaleObject(
          stockDto,
          quantitySold,
          taxCharged,
          correspondingPurchase,
        );

        this.logger.log('Save the sale and update the purchase');

        const newStock = this.createStockRegistrationObject(sale);

        await this.saleRepository.save(sale);
        await this.purchaseRepository.save(correspondingPurchase);
        await this.stockRegistrationRepository.save(newStock);
        this.logger.log('Stock Purchase registered successfully!');

        const operations = this.createOperationsObject(
          correspondingPurchase,
          sale,
        );

        await this.operationsRepository.save(operations);

        quantityExecuted += quantitySold;
        quantityToSell -= quantitySold;

        this.logger.log(
          `Sale of ${quantitySold} units successfully completed!`,
        );
      } else if (
        quantityExecuted !== 0 &&
        quantityExecuted < stockDto.quantity
      ) {
        quantityToSell = 0;
        throw new AppError(
          `It was possible to perform only ${quantityExecuted} actions out of the ${quantity} requested`,
          HttpStatus.PARTIAL_CONTENT,
        );
      } else {
        quantityToSell = 0;
        throw new AppError(
          'It was not possible to find a purchase with the corresponding ticket in the "Open" state',
          HttpStatus.NOT_FOUND,
        );
      }
    }
  }

  private async getCorrespondingPurchase(
    ticket: string,
  ): Promise<Purchase | undefined> {
    return this.purchaseRepository.findOne({
      where: { ticket, status: 'OPEN' },
      order: { operation_date: 'ASC' },
    });
  }

  private createSaleObject(
    stockDto: StockRegistrationDto,
    quantitySold: number,
    taxCharged: boolean,
    correspondingPurchase: Purchase,
  ): Sale {
    const sale = new Sale();
    sale.operation_date = stockDto.operation_date;
    sale.ticket = stockDto.ticket;
    sale.value = stockDto.value;
    sale.quantity = quantitySold;

    if (!taxCharged) {
      sale.tax = stockDto.tax;
      taxCharged = true;
    } else {
      sale.tax = 0;
    }

    sale.total_operation = stockDto.value * quantitySold - sale.tax;
    sale.purchase_ticket_id = correspondingPurchase;
    sale.irrf = IRRF_RATE * quantitySold * stockDto.value;

    return sale;
  }

  private createStockRegistrationObject(sale: Sale): StockRegistration {
    return this.stockRegistrationRepository.create({
      ...sale,
      type: TypeStock.SALE,
    });
  }

  private createOperationsObject(
    correspondingPurchase: Purchase,
    sale: Sale,
  ): Operations {
    const operations = new Operations();
    operations.purchase_ticket_id = correspondingPurchase;
    operations.ticket = correspondingPurchase.ticket;
    operations.total_purchase = correspondingPurchase.total_operation;
    operations.sale_ticket_id = sale.id;
    operations.total_sale = sale.total_operation;
    operations.gross_profit =
      sale.total_operation - correspondingPurchase.total_operation;
    operations.irrf = sale.irrf;
    operations.darf =
      sale.total_operation >= 20000 && operations.gross_profit > 0
        ? (operations.gross_profit - operations.irrf) * 0.15
        : 0;
    operations.net_profit = operations.gross_profit - operations.darf;

    return operations;
  }
}
