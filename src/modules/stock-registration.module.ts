import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationsController } from '../controllers/operations.controller';
import { StockRegistrationController } from '../controllers/stock-registration.controller';
import { Operations } from '../entities/operations.entity';
import { Purchase } from '../entities/purchase.entity';
import { Sale } from '../entities/sale.entity';
import { StockRegistration } from '../entities/stock-registration.entity';
import { OperationsService } from '../services/operations.service';
import { StockPurchaseService } from '../services/stock-purchase.service';
import { StockSaleService } from '../services/stock-sale.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockRegistration, Purchase, Sale, Operations]),
  ],
  controllers: [StockRegistrationController, OperationsController],
  providers: [StockPurchaseService, StockSaleService, OperationsService],
})
export class StockRegistrationModule {}
