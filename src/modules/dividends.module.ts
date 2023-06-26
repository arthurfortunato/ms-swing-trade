import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DividendsController } from '../controllers/dividends.controller';
import { Dividends } from '../entities/dividends.entity';
import { DividendsService } from '../services/dividends.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dividends])],
  controllers: [DividendsController],
  providers: [DividendsService],
})
export class DividendsModule {}
