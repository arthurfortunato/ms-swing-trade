import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockRegistrationDto } from '../dtos/stock-registration.dto';
import { Repository } from 'typeorm';
import { StockRegistration } from '../entities/stock-registration.entity';
import { Purchase } from '../entities/purchase.entity';
import { TypeStock } from '../enums/type-stock.enum';
import { StatusStock } from '../enums/status-stock.enum';
import { AppError } from '../error/AppError';

@Injectable()
export class StockPurchaseService {
  private readonly logger = new Logger(StockPurchaseService.name);

  constructor(
    @InjectRepository(StockRegistration)
    private stockRegistrationRepository: Repository<StockRegistration>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
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
      throw new AppError(
        'Error registered purchase',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async getAllRegistrations() {
    const registrations = await this.stockRegistrationRepository.find();

    if (registrations.length === 0) {
      throw new AppError('No registrations found', HttpStatus.NOT_FOUND);
    }
    return registrations;
  }

  async getRegistrationsPurchase(): Promise<StockRegistration[]> {
    const registrationsPurchase = await this.stockRegistrationRepository.find({
      where: { type: TypeStock.PURCHASE },
    });

    if (registrationsPurchase.length === 0) {
      throw new AppError('No registrations found', HttpStatus.NOT_FOUND);
    }

    return registrationsPurchase;
  }

  async getRegistrationsSale(): Promise<StockRegistration[]> {
    const registrationsSale = await this.stockRegistrationRepository.find({
      where: { type: TypeStock.SALE },
    });

    if (registrationsSale.length === 0) {
      throw new AppError('No registrations found', HttpStatus.NOT_FOUND);
    }
    return registrationsSale;
  }
}
