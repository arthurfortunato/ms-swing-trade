import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operations } from 'src/entities/operations.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { Sale } from 'src/entities/sale.entity';
import { calculateDarf } from 'src/utils/calculateDarf';
import { calculateDifferenceInDays } from 'src/utils/calculateDifferenceInDays';
import { AppError } from 'src/error/AppError';

@Injectable()
export class OperationsService {
  private readonly logger = new Logger(OperationsService.name);

  constructor(
    @InjectRepository(Operations)
    private operationsRepository: Repository<Operations>,
  ) {}

  async createOperation(correspondingPurchase: Purchase, sale: Sale) {
    try {
      this.logger.log('Starting save operation...');

      const {
        ticket,
        total_operation: purchaseTotalOperation,
        operation_date: purchaseOperationDate,
      } = correspondingPurchase;

      const {
        id: idSale,
        total_operation: saleTotalOperation,
        irrf: saleIrrf,
        operation_date: saleOperationDate,
      } = sale;

      const operations = new Operations();
      operations.purchase_ticket_id = correspondingPurchase;
      operations.ticket = ticket;
      operations.total_purchase = purchaseTotalOperation;
      operations.sale_ticket_id = idSale;
      operations.total_sale = saleTotalOperation;
      operations.gross_profit = saleTotalOperation - purchaseTotalOperation;
      operations.irrf = saleIrrf;

      operations.darf = calculateDarf(
        saleTotalOperation,
        operations.gross_profit,
        operations.irrf,
      );

      operations.net_profit = operations.gross_profit - operations.darf;

      const investedDays = calculateDifferenceInDays(
        purchaseOperationDate,
        saleOperationDate,
      );
      operations.invested_days = investedDays;

      operations.percentage =
        (operations.gross_profit / purchaseTotalOperation) * 100;

      await this.operationsRepository.save(operations);
      this.logger.log('Operation saved successfully.');
    } catch (error) {
      throw new AppError(
        'Error  occurred while creating operation',
        500,
        error,
      );
    }
  }
}
