import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DividendsController } from 'src/controllers/dividends.controller';
import { Dividends } from 'src/entities/dividends.entity';
import { DividendsService } from 'src/services/dividends.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dividends])],
  controllers: [DividendsController],
  providers: [DividendsService],
})
export class DividendsModule {}
