import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Operations } from '../entities/operations.entity';
import { Purchase } from '../entities/purchase.entity';
import { Sale } from '../entities/sale.entity';
import { calculateDarf } from '../utils/calculateDarf';
import { calculateDifferenceInDays } from '../utils/calculateDifferenceInDays';
import { AppError } from '../error/AppError';

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
      operations.sale_operation_date = sale.operation_date;
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

  async getOperations() {
    const operations = await this.operationsRepository.find();

    if (operations.length === 0) {
      throw new AppError('No operations found', HttpStatus.NOT_FOUND);
    }
    return operations;
  }

  async getOperationsByTicket(ticket: string): Promise<Operations[]> {
    const operationsByTicket = await this.operationsRepository.find({
      where: { ticket },
    });

    if (operationsByTicket.length === 0) {
      throw new AppError('No operations found', HttpStatus.NOT_FOUND);
    }

    return operationsByTicket;
  }

  async getOperationsByYear(year: number): Promise<Operations[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const operations = await this.operationsRepository.find({
      where: {
        sale_operation_date: Between(startDate, endDate),
      },
    });

    if (operations.length === 0) {
      throw new AppError(
        'No operations in the selected period',
        HttpStatus.NOT_FOUND,
      );
    }

    return operations;
  }

  async getOperationsByYearAndMonth(
    year: number,
    month: number,
  ): Promise<Operations[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const operations = await this.operationsRepository
      .createQueryBuilder('operations')
      .where('operations.sale_operation_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    if (operations.length === 0) {
      throw new AppError(
        'No operations in the selected period',
        HttpStatus.NOT_FOUND,
      );
    }

    return operations;
  }
}
