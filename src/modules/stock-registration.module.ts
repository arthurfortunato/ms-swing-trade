import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockRegistrationController } from 'src/controllers/stock-registration.controller';
import { Purchase } from 'src/entities/purchase.entity';
import { Sale } from 'src/entities/sale.entity';
import { StockRegistration } from 'src/entities/stock-registration.entity';
import { StockRegistrationService } from 'src/services/stock-registration.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockRegistration, Purchase, Sale])],
  controllers: [StockRegistrationController],
  providers: [StockRegistrationService],
})
export class StockRegistrationModule {}
