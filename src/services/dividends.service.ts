import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DividendsDto } from 'src/dtos/dividends.dto';
import { Dividends } from 'src/entities/dividends.entity';
import { AppError } from 'src/error/AppError';
import { Repository } from 'typeorm';

@Injectable()
export class DividendsService {
  private readonly logger = new Logger(DividendsService.name);

  constructor(
    @InjectRepository(Dividends)
    private dividendsRepository: Repository<Dividends>,
  ) {}

  async createDividends(dividendsDto: DividendsDto) {
    try {
      this.logger.log('Starting registered dividends');

      const { rate, quantity } = dividendsDto;
      const total = rate * quantity;

      const newDividends = this.dividendsRepository.create({
        total: total,
        ...dividendsDto,
      });

      await this.dividendsRepository.save(newDividends);
      this.logger.log('Dividends registered successfully!');

      return newDividends;
    } catch (error) {
      throw new AppError(
        'Error registered dividends',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
