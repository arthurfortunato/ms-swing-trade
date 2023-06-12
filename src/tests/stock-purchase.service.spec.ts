import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockPurchaseService } from '../services/stock-purchase.service';
import { StockRegistration } from '../entities/stock-registration.entity';
import { Purchase } from '../entities/purchase.entity';
import { AppError } from '../error/AppError';
import { HttpStatus } from '@nestjs/common';
import { TypeStock } from '../enums/type-stock.enum';
import { StatusStock } from '../enums/status-stock.enum';

describe('StockPurchaseService', () => {
  let service: StockPurchaseService;
  let stockRegistrationRepository: Repository<StockRegistration>;
  let purchaseRepository: Repository<Purchase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockPurchaseService,
        {
          provide: getRepositoryToken(StockRegistration),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Purchase),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StockPurchaseService>(StockPurchaseService);
    stockRegistrationRepository = module.get<Repository<StockRegistration>>(
      getRepositoryToken(StockRegistration),
    );
    purchaseRepository = module.get<Repository<Purchase>>(
      getRepositoryToken(Purchase),
    );
  });

  describe('createStockPurchase', () => {
    it('should create a new stock purchase and return the created entity', async () => {
      const stockDto = {
        ticket: 'VALE3',
        operation_date: new Date('2023-06-06'),
        value: 65,
        quantity: 300,
        tax: 20,
      };

      const createdStockRegistration = new StockRegistration();
      createdStockRegistration.ticket = stockDto.ticket;
      createdStockRegistration.operation_date = stockDto.operation_date;
      createdStockRegistration.value = stockDto.value;
      createdStockRegistration.quantity = stockDto.quantity;
      createdStockRegistration.tax = stockDto.tax;
      createdStockRegistration.type = TypeStock.PURCHASE;

      const createdPurchase = new Purchase();
      createdPurchase.ticket = stockDto.ticket;
      createdPurchase.operation_date = stockDto.operation_date;
      createdPurchase.value = stockDto.value;
      createdPurchase.quantity = stockDto.quantity;
      createdPurchase.tax = stockDto.tax;
      createdPurchase.status = StatusStock.OPEN;

      jest
        .spyOn(stockRegistrationRepository, 'create')
        .mockReturnValue(createdStockRegistration);
      jest
        .spyOn(stockRegistrationRepository, 'save')
        .mockResolvedValue(createdStockRegistration);
      jest.spyOn(purchaseRepository, 'create').mockReturnValue(createdPurchase);
      jest.spyOn(purchaseRepository, 'save').mockResolvedValue(createdPurchase);

      const result = await service.createStockPurchase(stockDto);

      expect(stockRegistrationRepository.create).toHaveBeenCalledWith({
        ...stockDto,
        total_operation: stockDto.value * stockDto.quantity + stockDto.tax,
        type: TypeStock.PURCHASE,
      });
      expect(stockRegistrationRepository.save).toHaveBeenCalledWith(
        createdStockRegistration,
      );
      expect(purchaseRepository.create).toHaveBeenCalledWith({
        ...createdStockRegistration,
        status: StatusStock.OPEN,
      });
      expect(purchaseRepository.save).toHaveBeenCalledWith(createdPurchase);
      expect(result).toEqual(createdStockRegistration);
    });

    it('should throw an AppError if an error occurs during the process', async () => {
      const stockDto = {
        ticket: 'VALE3',
        operation_date: new Date('2023-06-06'),
        value: 65,
        quantity: 300,
        tax: 20,
      };

      jest
        .spyOn(stockRegistrationRepository, 'create')
        .mockImplementation(() => {
          throw new Error('Error registered purchase');
        });

      try {
        await service.createStockPurchase(stockDto);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('Error registered purchase');
        expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllRegistrations', () => {
    it('should return an array of stock registrations', async () => {
      const registrations = [new StockRegistration(), new StockRegistration()];

      jest
        .spyOn(stockRegistrationRepository, 'find')
        .mockResolvedValue(registrations);

      const result = await service.getAllRegistrations();

      expect(stockRegistrationRepository.find).toHaveBeenCalled();
      expect(result).toEqual(registrations);
    });

    it('should throw an AppError if no registrations are found', async () => {
      jest.spyOn(stockRegistrationRepository, 'find').mockResolvedValue([]);

      try {
        await service.getAllRegistrations();
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No registrations found');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getRegistrationsByTicket', () => {
    it('should return registrations with the specified ticket', async () => {
      const ticket = 'VALE3';
      const registrations = [new StockRegistration(), new StockRegistration()];

      jest
        .spyOn(stockRegistrationRepository, 'find')
        .mockResolvedValueOnce(registrations);

      const result = await service.getRegistrationsByTicket(ticket);

      expect(stockRegistrationRepository.find).toHaveBeenCalled();
      expect(result).toEqual(registrations);
    });

    it('should throw an AppError when no registrations by ticket are found', async () => {
      jest.spyOn(stockRegistrationRepository, 'find').mockResolvedValueOnce([]);

      try {
        const ticket = 'PETR4';
        await service.getRegistrationsByTicket(ticket);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No registrations found');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getRegistrationsPurchase', () => {
    it('should return an array of purchase registrations', async () => {
      const registrationsPurchase = [
        new StockRegistration(),
        new StockRegistration(),
      ];

      jest
        .spyOn(stockRegistrationRepository, 'find')
        .mockResolvedValue(registrationsPurchase);

      const result = await service.getRegistrationsPurchase();

      expect(stockRegistrationRepository.find).toHaveBeenCalledWith({
        where: { type: 'PURCHASE' },
      });
      expect(result).toEqual(registrationsPurchase);
    });
    it('should throw an AppError if no purchase registrations are found', async () => {
      jest.spyOn(stockRegistrationRepository, 'find').mockResolvedValue([]);

      try {
        await service.getRegistrationsPurchase();
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No registrations found');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getRegistrationsPurchaseActive', () => {
    it('should return an array of active purchase registrations', async () => {
      const purchase1 = new Purchase();
      purchase1.status = 'OPEN';
      const purchase2 = new Purchase();
      purchase2.status = 'OPEN';
      const purchase3 = new Purchase();
      purchase3.status = 'CLOSE';

      const activePurchase = [purchase1, purchase2, purchase3];

      jest
        .spyOn(purchaseRepository, 'find')
        .mockResolvedValue(activePurchase);

      const result = await service.getRegistrationsPurchaseActive();

      expect(purchaseRepository.find).toHaveBeenCalledWith({
        where: { status: 'OPEN' },
      });
      
      expect(result).toEqual(activePurchase);
    });

    it('should throw an AppError if no active purchase registrations are found', async () => {
      jest.spyOn(purchaseRepository, 'find').mockResolvedValue([]);

      try {
        await service.getRegistrationsPurchaseActive();
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No active purchases found');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getRegistrationsSale', () => {
    it('should return an array of sale registrations', async () => {
      const registrationsSale = [
        new StockRegistration(),
        new StockRegistration(),
      ];

      jest
        .spyOn(stockRegistrationRepository, 'find')
        .mockResolvedValue(registrationsSale);

      const result = await service.getRegistrationsSale();

      expect(stockRegistrationRepository.find).toHaveBeenCalledWith({
        where: { type: 'SALE' },
      });
      expect(result).toEqual(registrationsSale);
    });
    it('should throw an AppError if no sale registrations are found', async () => {
      jest.spyOn(stockRegistrationRepository, 'find').mockResolvedValue([]);
      try {
        await service.getRegistrationsSale();
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('No registrations found');
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
