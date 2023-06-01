import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockRegistrationDto } from 'src/dtos/stock-registration.dto';
import { Repository } from 'typeorm';
import { StockRegistration } from '../entities/stock-registration.entity';
import { TypeStock } from 'src/enums/type-stock.enum';

@Injectable()
export class StockRegistrationService {
  private readonly logger = new Logger(StockRegistrationService.name);

  constructor(
    @InjectRepository(StockRegistration)
    private stockRegistrationRepository: Repository<StockRegistration>,
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
      this.logger.log('Stock Purchase registered successfully!');
      return newStock;
    } catch (error) {
      this.logger.error('Error registerd purchase', error);
    }
  }
}
