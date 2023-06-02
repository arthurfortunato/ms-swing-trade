import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockRegistrationDto } from 'src/dtos/stock-registration.dto';
import { Repository } from 'typeorm';
import { StockRegistration } from '../entities/stock-registration.entity';
import { TypeStock } from 'src/enums/type-stock.enum';
import { Purchase } from 'src/entities/purchase.entity';
import { StatusStock } from 'src/enums/status-stock.enum';
import { Sale } from 'src/entities/sale.entity';

@Injectable()
export class StockRegistrationService {
  private readonly logger = new Logger(StockRegistrationService.name);

  constructor(
    @InjectRepository(StockRegistration)
    private stockRegistrationRepository: Repository<StockRegistration>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
  ) {}

  async createStockPurchase(stockDto: StockRegistrationDto) {
    try {
      this.logger.log('Starting registered stock purchase');

      const { value, quantity, tax } = stockDto;
      const type = TypeStock.PURCHASE;
      const totalOperation = value * quantity + tax;

      const newStock = this.stockRegistrationRepository.create({
        ...stockDto,
        total_operation: totalOperation,
        type: type,
      });

      await this.stockRegistrationRepository.save(newStock);
      this.logger.log('Stock Purchase registered successfully!');

      const status = StatusStock.OPEN;
      const newPurchase = this.purchaseRepository.create({
        ...newStock,
        status: status,
      });
      await this.purchaseRepository.save(newPurchase);

      return newStock;
    } catch (error) {
      this.logger.error('Error registerd purchase', error);
    }
  }

  async createStockSale(stockDto: StockRegistrationDto) {
    try {
      this.logger.log('Starting registered stock sale');

      const { value, quantity, tax } = stockDto;
      const type = TypeStock.SALE;
      const totalOperation = value * quantity - tax;

      const newStock = this.stockRegistrationRepository.create({
        ...stockDto,
        total_operation: totalOperation,
        type: type,
      });

      await this.stockRegistrationRepository.save(newStock);
      await this.makingSale(newStock);
      this.logger.log('Stock Purchase registered successfully!');
      return newStock;
    } catch (error) {
      this.logger.error('Error registerd purchase', error);
    }
  }

  async makingSale(stockDto: StockRegistrationDto) {
    const ticket = stockDto.ticket;
    let quantityToSell = stockDto.quantity;

    while (quantityToSell > 0) {
      this.logger.log(
        'Check if there is a corresponding purchase with the ticket',
      );

      const correspondingPurchase = await this.purchaseRepository.findOne({
        where: { ticket, status: 'OPEN' },
        order: { operation_date: 'ASC' },
      });

      if (correspondingPurchase) {
        if (correspondingPurchase.quantity >= quantityToSell) {
          correspondingPurchase.quantity -= quantityToSell;
          correspondingPurchase.status = 'CLOSE';

          const sale = new Sale();
          sale.operation_date = stockDto.operation_date;
          sale.ticket = stockDto.ticket;
          sale.value = stockDto.value;
          sale.quantity = quantityToSell;
          sale.tax = stockDto.tax;
          sale.total_operation = stockDto.value * quantityToSell - stockDto.tax;
          sale.purchase_id = correspondingPurchase;

          this.logger.log('Save the sale and update the purchase');
          await this.saleRepository.save(sale);
          await this.purchaseRepository.save(correspondingPurchase);

          this.logger.log(
            `Sale of ${quantityToSell} units successfully completed!`,
          );
          quantityToSell = 0;
        } else {
          const quantitySold = correspondingPurchase.quantity;
          correspondingPurchase.quantity = 0;
          correspondingPurchase.status = 'CLOSE';

          const sale = new Sale();
          sale.operation_date = stockDto.operation_date;
          sale.ticket = stockDto.ticket;
          sale.value = stockDto.value;
          sale.quantity = quantitySold;
          sale.tax = stockDto.tax;
          sale.total_operation = stockDto.value * quantitySold - stockDto.tax;
          sale.purchase_id = correspondingPurchase;

          await this.saleRepository.save(sale);
          await this.purchaseRepository.save(correspondingPurchase);

          this.logger.log(
            `Sale of ${quantitySold} units successfully completed!`,
          );
          quantityToSell -= quantitySold;
        }
      } else {
        this.logger.log(
          'It was not possible to find a purchase with the corresponding ticket in the "Open" state',
        );
        quantityToSell = 0;
      }
    }
  }
}
