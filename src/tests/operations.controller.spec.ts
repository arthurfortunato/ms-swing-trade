import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationsController } from '../controllers/operations.controller';
import { Operations } from '../entities/operations.entity';
import { OperationsService } from '../services/operations.service';

describe('OperationsController', () => {
  let controller: OperationsController;
  let service: OperationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationsController],
      providers: [
        OperationsService,
        {
          provide: getRepositoryToken(Operations),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<OperationsController>(OperationsController);
    service = module.get<OperationsService>(OperationsService);
  });

  describe('getAllOperations', () => {
    it('should return all operations', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const operations = [new Operations(), new Operations()];

      jest.spyOn(service, 'getOperations').mockResolvedValue(operations);

      await controller.getAllOperations(response as any);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(operations);
    });
  });

  describe('getOperationsByTicket', () => {
    it('should return operations by ticket', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const ticket = 'VALE3';

      const operations1 = new Operations();
      operations1.ticket = 'VALE3';
      const operations2 = new Operations();
      operations2.ticket = 'VALE3';
      const operations3 = new Operations();
      operations3.ticket = 'VALE4';

      const operations = [operations1, operations2, operations3];

      jest
        .spyOn(service, 'getOperationsByTicket')
        .mockResolvedValueOnce(operations);

      await controller.getOperationsByTicket(response as any, ticket);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(operations);
      expect(service.getOperationsByTicket).toHaveBeenCalledWith(ticket);
      expect(service.getOperationsByTicket).not.toHaveBeenCalledWith('VALE4');
    });
  });

  describe('getOperationsByYear', () => {
    it('should return operations by year', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const year = 2023;

      const operations1 = new Operations();
      operations1.sale_operation_date = new Date('2023-03-25');
      const operations2 = new Operations();
      operations2.sale_operation_date = new Date('2023-06-08');
      const operations3 = new Operations();
      operations3.sale_operation_date = new Date('2022-06-08');

      const operations = [operations1, operations2, operations3];

      jest
        .spyOn(service, 'getOperationsByYear')
        .mockResolvedValueOnce(operations);

      await controller.getOperationsByYear(response as any, year);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(operations);
      expect(service.getOperationsByYear).toHaveBeenCalledWith(year);
      expect(service.getOperationsByYear).not.toHaveBeenCalledWith(operations3);
    });
  });

  describe('getOperationsByYearAndMonth', () => {
    it('should return operations by year and month', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const year = 2023;
      const month = 6;

      const operations1 = new Operations();
      operations1.sale_operation_date = new Date('2023-06-02');
      const operations2 = new Operations();
      operations2.sale_operation_date = new Date('2023-06-08');
      const operations3 = new Operations();
      operations3.sale_operation_date = new Date('2023-05-08');

      const operations = [operations1, operations2, operations3];

      jest
        .spyOn(service, 'getOperationsByYearAndMonth')
        .mockResolvedValueOnce(operations);

      await controller.getOperationsByYearAndMonth(
        response as any,
        year,
        month,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(operations);
      expect(service.getOperationsByYearAndMonth).toHaveBeenCalledWith(
        year,
        month,
      );
      expect(service.getOperationsByYearAndMonth).not.toHaveBeenCalledWith(
        operations3,
      );
    });
  });
});
