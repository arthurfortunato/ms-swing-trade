import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { StockRegistrationController } from '../controllers/stock-registration.controller';
import { Operations } from '../entities/operations.entity';
import { Purchase } from '../entities/purchase.entity';
import { Sale } from '../entities/sale.entity';
import { StockRegistration } from '../entities/stock-registration.entity';
import { OperationsService } from '../services/operations.service';
import { StockPurchaseService } from '../services/stock-purchase.service';
import { StockSaleService } from '../services/stock-sale.service';

describe('StockRegistrationController', () => {
  let controller: StockRegistrationController;
  let purchaseService: StockPurchaseService;
  let saleService: StockSaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockRegistrationController],
      providers: [
        StockPurchaseService,
        StockSaleService,
        OperationsService,
        {
          provide: getRepositoryToken(Purchase),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Sale),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(StockRegistration),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Operations),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<StockRegistrationController>(
      StockRegistrationController,
    );
    purchaseService = module.get<StockPurchaseService>(StockPurchaseService);
    saleService = module.get<StockSaleService>(StockSaleService);
  });

  describe('createStockPurchase', () => {
    it('should create a new stock purchase', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const purchase = new Purchase();
      purchase.ticket = 'VALE3';
      purchase.quantity = 300;
      purchase.operation_date = new Date('2023-06-06');
      purchase.tax = 20;
      purchase.value = 65;

      jest
        .spyOn(purchaseService, 'createStockPurchase')
        .mockResolvedValue(purchase);

      await controller.createStockPurchase(purchase, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(purchaseService.createStockPurchase).toHaveBeenCalledWith(
        purchase,
      );
      expect(response.send).toHaveBeenCalledWith({
        message: 'Successful purchase!',
      });
    });
  });

  describe('createStockSale', () => {
    it('should create a new stock sale', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const sale = new Sale();
      sale.ticket = 'VALE3';
      sale.quantity = 300;
      sale.operation_date = new Date('2023-06-06');
      sale.tax = 20;
      sale.value = 65;

      jest.spyOn(saleService, 'createStockSale').mockResolvedValue();

      await controller.createStockSale(sale, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(saleService.createStockSale).toHaveBeenCalledWith(sale);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Successful sale!',
      });
    });
  });

  describe('getAllRegistrations', () => {
    it('should return all registrations', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const registrations = [new StockRegistration(), new StockRegistration()];

      jest
        .spyOn(purchaseService, 'getAllRegistrations')
        .mockResolvedValue(registrations);

      await controller.getAllRegistrations(response as any);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(registrations);
    });
  });

  describe('getRegistrationsByTicket', () => {
    it('should return registrations by ticket', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const ticket = 'VALE3';
      const registration1 = new StockRegistration();
      registration1.ticket = 'VALE3';
      const registration2 = new StockRegistration();
      registration2.ticket = 'VALE3';
      const registration3 = new StockRegistration();
      registration3.ticket = 'VALE4';

      const registrations = [registration1, registration2, registration3];

      jest
        .spyOn(purchaseService, 'getRegistrationsByTicket')
        .mockResolvedValue(registrations);

      await controller.getRegistrationsByTicket(response as any, ticket);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(registrations);
      expect(purchaseService.getRegistrationsByTicket).toHaveBeenCalledWith(
        ticket,
      );
      expect(purchaseService.getRegistrationsByTicket).not.toHaveBeenCalledWith(
        'VALE4',
      );
    });
  });

  describe('getRegistrationsPurchase', () => {
    it('should return all purchases registrations', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const operations = [new Sale(), new Purchase(), new Purchase()];

      jest
        .spyOn(purchaseService, 'getRegistrationsPurchase')
        .mockResolvedValue(operations);

      await controller.getRegistrationsPurchase(response);

      const numberOfPurchases = operations.filter(
        (operation) => operation instanceof Purchase,
      ).length;

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(operations);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(numberOfPurchases).toBe(2);
    });
  });

  describe('getRegistrationsSale', () => {
    it('should return all sales registrations', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const operations = [new Sale(), new Purchase(), new Purchase()];

      jest
        .spyOn(purchaseService, 'getRegistrationsSale')
        .mockResolvedValue(operations);

      await controller.getRegistrationsSale(response as any);

      const numberOfSales = operations.filter(
        (operation) => operation instanceof Sale,
      ).length;

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(operations);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(numberOfSales).toBe(1);
    });
  });
});
