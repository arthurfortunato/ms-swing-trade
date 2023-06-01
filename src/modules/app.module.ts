import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { StockRegistrationModule } from './stock-registration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    DatabaseModule,
    StockRegistrationModule  
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
