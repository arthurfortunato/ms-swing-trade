import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockRegistrationDto } from 'src/dtos/stock-registration.dto';
import { Repository } from 'typeorm';
import { StockRegistration } from '../entities/stock-registration.entity';

@Injectable()
export class StockRegistrationService {
  private readonly logger = new Logger(StockRegistrationService.name);

  constructor(
    @InjectRepository(StockRegistration)
    private stockRegistrationRepository: Repository<StockRegistration>,
  ) {}

  async createStock(stockDto: StockRegistrationDto) {
    const newStock = this.stockRegistrationRepository.create(stockDto);
    await this.stockRegistrationRepository.save(newStock);
    return newStock;
  }
}
