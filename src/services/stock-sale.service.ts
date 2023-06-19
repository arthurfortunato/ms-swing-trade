import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockRegistrationDto } from '../dtos/stock-registration.dto';
import { StockRegistration } from '../entities/stock-registration.entity';
import { TypeStock } from '../enums/type-stock.enum';
import { Purchase } from '../entities/purchase.entity';
import { Sale } from '../entities/sale.entity';
import { AppError } from '../error/AppError';
import { OperationsService } from './operations.service';

const IRRF_RATE = 0.00005;
const STOCK_STATUS_CLOSE = 'CLOSE';

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
    private operationsService: OperationsService,
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
          correspondingPurchase.status = STOCK_STATUS_CLOSE;
        }

        const sale = this.createSaleObject(
          stockDto,
          quantitySold,
          taxCharged,
          correspondingPurchase,
        );

        taxCharged = true;

        const newStock = this.createStockRegistrationObject(sale);

        await this.saleRepository.save(sale);
        await this.purchaseRepository.save(correspondingPurchase);
        await this.stockRegistrationRepository.save(newStock);
        await this.operationsService.createOperation(
          correspondingPurchase,
          sale,
        );
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
        this.logger.warn(
          `It was possible to perform only ${quantityExecuted} actions out of the ${quantity} requested`,
        );
        throw new AppError(
          `It was possible to perform only ${quantityExecuted} actions out of the ${quantity} requested`,
          HttpStatus.PARTIAL_CONTENT,
        );
      } else {
        quantityToSell = 0;
        this.logger.error(
          'It was not possible to find a purchase with the corresponding ticket in the "Open" state',
        );
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
    const { operation_date, ticket, value, tax } = stockDto;
    sale.type = TypeStock.SALE;
    sale.operation_date = operation_date;
    sale.ticket = ticket;
    sale.value = value;
    sale.quantity = quantitySold;

    if (!taxCharged) {
      sale.tax = tax;
      taxCharged = true;
    } else {
      sale.tax = 0;
    }

    sale.total_operation = value * quantitySold - sale.tax;
    sale.purchase_ticket_id = correspondingPurchase;
    sale.irrf = IRRF_RATE * quantitySold * value;

    return sale;
  }

  private createStockRegistrationObject(sale: Sale): StockRegistration {
    return this.stockRegistrationRepository.create({
      ...sale,
      type: TypeStock.SALE,
    });
  }
}
