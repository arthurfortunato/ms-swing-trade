import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockRegistrationController } from 'src/controllers/stock-registration.controller';
import { StockRegistration } from 'src/entities/stock-registration.entity';
import { StockRegistrationService } from 'src/services/stock-registration.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockRegistration])],
  controllers: [StockRegistrationController],
  providers: [StockRegistrationService],
})
export class StockRegistrationModule {}
