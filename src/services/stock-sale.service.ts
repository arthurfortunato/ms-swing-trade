import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockRegistrationDto } from 'src/dtos/stock-registration.dto';
import { Repository } from 'typeorm';
import { StockRegistration } from '../entities/stock-registration.entity';
import { TypeStock } from 'src/enums/type-stock.enum';
import { Purchase } from 'src/entities/purchase.entity';
import { Sale } from 'src/entities/sale.entity';
import { AppError } from 'src/error/AppError';

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

      const correspondingPurchase = await this.purchaseRepository.findOne({
        where: { ticket, status: 'OPEN' },
        order: { operation_date: 'ASC' },
      });

      if (correspondingPurchase) {
        const quantitySold = Math.min(
          correspondingPurchase.quantity,
          quantityToSell,
        );

        correspondingPurchase.quantity -= quantitySold;

        if (correspondingPurchase.quantity === 0) {
          correspondingPurchase.status = 'CLOSE';
        }

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
        sale.irrf = 0.00005 * quantitySold * stockDto.value;

        this.logger.log('Save the sale and update the purchase');

        const type = TypeStock.SALE;
        const newStock = this.stockRegistrationRepository.create({
          ...sale,
          type,
        });

        await this.saleRepository.save(sale);
        await this.purchaseRepository.save(correspondingPurchase);
        await this.stockRegistrationRepository.save(newStock);
        this.logger.log('Stock Purchase registered successfully!');

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
}
