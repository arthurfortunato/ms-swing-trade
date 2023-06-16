import { Operations } from '../entities/operations.entity';
import { Repository } from 'typeorm';
import { OperationsService } from '../services/operations.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Purchase } from '../entities/purchase.entity';
import { Sale } from '../entities/sale.entity';
import { HttpStatus } from '@nestjs/common';
import { AppError } from '../error/AppError';

describe('OperationsService', () => {
  let service: OperationsService;
  let operationsRepository: Repository<Operations>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationsService,
        {
          provide: getRepositoryToken(Operations),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OperationsService>(OperationsService);
    operationsRepository = module.get<Repository<Operations>>(
      getRepositoryToken(Operations),
    );
  });

  describe('createOperation', () => {
    it('should create an operation', async () => {
      const correspondingPurchase = new Purchase();
      correspondingPurchase.ticket = 'VALE3';
      correspondingPurchase.total_operation = 25000;
      correspondingPurchase.operation_date = new Date('2023-06-08');

      const sale = new Sale();
      sale.id = 1;
      sale.total_operation = 26000;
      sale.irrf = 0.05;
      sale.operation_date = new Date('2023-06-10');

      const previousOperation = new Operations();
      previousOperation.loss_compensate = -50;

      const operations = new Operations();
      operations.purchase_ticket_id = correspondingPurchase;
      operations.ticket = 'VALE3';
      operations.total_purchase = 25000;
      operations.sale_ticket_id = 1;
      operations.total_sale = 26000;
      operations.sale_operation_date = new Date('2023-06-10');
      operations.irrf = 0.05;
      operations.gross_profit = 1000;
      operations.darf = 149.95;
      operations.net_profit = 850.05;
      operations.invested_days = 2;
      operations.percentage = 4;

      operationsRepository.findOne = jest
        .fn()
        .mockResolvedValue(previousOperation);
      operationsRepository.save = jest.fn().mockResolvedValue(operations);

      await service.createOperation(correspondingPurchase, sale);

      expect(operationsRepository.findOne).toHaveBeenCalledWith({
        where: {
          loss_compensate: expect.any(Object),
        },
        order: {
          sale_operation_date: 'DESC',
        },
      });
      expect(operationsRepository.save).toHaveBeenCalledTimes(2);
      expect(operationsRepository.save).toHaveBeenCalledWith(previousOperation);
    });

    it('should throw an AppError when an error occurs', async () => {
      const correspondingPurchase = new Purchase();
      correspondingPurchase.ticket = 'VALE3';
      correspondingPurchase.total_operation = 1000;
      correspondingPurchase.operation_date = new Date('2023-06-08');

      const sale = new Sale();
      sale.id = 1;
      sale.total_operation = 1200;
      sale.irrf = 100;
      sale.operation_date = new Date('2023-06-10');

      jest
        .spyOn(operationsRepository, 'save')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      try {
        await service.createOperation(correspondingPurchase, sale);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('Error occurred while creating operation');
        expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getOperations', () => {
    it('should return an array of operations', async () => {
      const operations = [new Operations(), new Operations()];

      jest
        .spyOn(operationsRepository, 'find')
        .mockResolvedValueOnce(operations);

      const result = await service.getOperations();

      expect(operationsRepository.find).toHaveBeenCalled();
      expect(result).toEqual(operations);
    });

    it('should throw an AppError when no operations are found', async () => {
      jest.spyOn(operationsRepository, 'find').mockResolvedValueOnce([]);

      try {
        await service.getOperations();
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No operations found');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getOperationsByTicket', () => {
    it('should return operations with the specified ticket', async () => {
      const ticket = 'VALE3';
      const operations = [new Operations(), new Operations()];

      jest
        .spyOn(operationsRepository, 'find')
        .mockResolvedValueOnce(operations);

      const result = await service.getOperationsByTicket(ticket);

      expect(operationsRepository.find).toHaveBeenCalled();
      expect(result).toEqual(operations);
    });

    it('should throw an AppError when no operations by ticket are found', async () => {
      jest.spyOn(operationsRepository, 'find').mockResolvedValueOnce([]);

      try {
        const ticket = 'PETR4';
        await service.getOperationsByTicket(ticket);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No operations found');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getOperationsByYear', () => {
    it('should return operations within the specified year', async () => {
      const year = 2023;

      const operations = [new Operations(), new Operations()];

      jest
        .spyOn(operationsRepository, 'find')
        .mockResolvedValueOnce(operations);

      const result = await service.getOperationsByYear(year);
      expect(result).toEqual(operations);
      expect(operationsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sale_operation_date: expect.any(Object),
          }),
        }),
      );
    });

    it('should throw an AppError when no operations are found within the specified year', async () => {
      const year = 2023;
      jest.spyOn(operationsRepository, 'find').mockResolvedValueOnce([]);

      try {
        await service.getOperationsByYear(year);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No operations in the selected period');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getOperationsByYearAndMonth', () => {
    it('should return operations within the specified year and month', async () => {
      const year = 2023;
      const month = 6;

      const operations = [new Operations(), new Operations()];

      jest
        .spyOn(operationsRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValueOnce(operations),
        } as any);

      const result = await service.getOperationsByYearAndMonth(year, month);

      expect(result).toEqual(operations);
      expect(operationsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'operations',
      );
    });

    it('should throw an AppError when no operations are found within the specified year and month', async () => {
      const year = 2023;
      const month = 6;

      jest
        .spyOn(operationsRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValueOnce([]),
        } as any);

      try {
        await service.getOperationsByYearAndMonth(year, month);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No operations in the selected period');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
