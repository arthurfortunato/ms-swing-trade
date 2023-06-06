import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationsController } from 'src/controllers/operations.controller';
import { StockRegistrationController } from 'src/controllers/stock-registration.controller';
import { Operations } from 'src/entities/operations.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { Sale } from 'src/entities/sale.entity';
import { StockRegistration } from 'src/entities/stock-registration.entity';
import { OperationsService } from 'src/services/operations.service';
import { StockPurchaseService } from 'src/services/stock-purchase.service';
import { StockSaleService } from 'src/services/stock-sale.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockRegistration, Purchase, Sale, Operations]),
  ],
  controllers: [StockRegistrationController, OperationsController],
  providers: [StockPurchaseService, StockSaleService, OperationsService],
})
export class StockRegistrationModule {}
