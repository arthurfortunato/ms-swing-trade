import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operations } from 'src/entities/operations.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { Sale } from 'src/entities/sale.entity';
import { calculateDifferenceInDays } from 'src/utils/calculateDifferenceInDays';
import { Repository } from 'typeorm';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operations)
    private operationsRepository: Repository<Operations>,
  ) {}
  async createOperation(correspondingPurchase: Purchase, sale: Sale) {
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
    operations.darf =
      saleTotalOperation >= 20000 && operations.gross_profit > 0
        ? (operations.gross_profit - operations.irrf) * 0.15
        : 0;
    operations.net_profit = operations.gross_profit - operations.darf;
    const startDate = new Date(purchaseOperationDate);
    const endDate = new Date(saleOperationDate);
    const investedDays = calculateDifferenceInDays(startDate, endDate);
    operations.invested_days = investedDays;
    operations.percentage =
      ((saleTotalOperation - purchaseTotalOperation) / purchaseTotalOperation) *
      100;

    await this.operationsRepository.save(operations);
  }
}
