import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockRegistrationController } from 'src/controllers/stock-registration.controller';
import { Purchase } from 'src/entities/purchase.entity';
import { Sale } from 'src/entities/sale.entity';
import { StockRegistration } from 'src/entities/stock-registration.entity';
import { StockPurchaseService } from 'src/services/stock-purchase.service';
import { StockSaleService } from 'src/services/stock-sale.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockRegistration, Purchase, Sale])],
  controllers: [StockRegistrationController],
  providers: [StockPurchaseService, StockSaleService],
})
export class StockRegistrationModule {}
