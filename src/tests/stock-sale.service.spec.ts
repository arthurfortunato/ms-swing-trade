import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockRegistrationDto } from '../dtos/stock-registration.dto';
import { StockRegistration } from '../entities/stock-registration.entity';
import { TypeStock } from '../enums/type-stock.enum';
import { StatusStock } from '../enums/status-stock.enum';
import { Purchase } from '../entities/purchase.entity';
import { Sale } from '../entities/sale.entity';
import { AppError } from '../error/AppError';
import { OperationsService } from '../services/operations.service';
import { StockSaleService } from '../services/stock-sale.service';
import { Operations } from '../entities/operations.entity';

const IRRF_RATE = 0.00005;
const STOCK_STATUS_CLOSE = 'CLOSE';

describe('StockSaleService', () => {
  let service: StockSaleService;
  let stockRegistrationRepository: Repository<StockRegistration>;
  let purchaseRepository: Repository<Purchase>;
  let saleRepository: Repository<Sale>;
  let operationsService: OperationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockSaleService,
        OperationsService,
        {
          provide: getRepositoryToken(StockRegistration),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Purchase),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Sale),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Operations),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StockSaleService>(StockSaleService);
    stockRegistrationRepository = module.get<Repository<StockRegistration>>(
      getRepositoryToken(StockRegistration),
    );
    purchaseRepository = module.get<Repository<Purchase>>(
      getRepositoryToken(Purchase),
    );
    saleRepository = module.get<Repository<Sale>>(getRepositoryToken(Sale));
    operationsService = module.get<OperationsService>(OperationsService);

    purchaseRepository.findOne = jest.fn();
  });

  describe('createStockSale', () => {
    it('should create a new stock sale and return the created entity', async () => {
      const stockDto: StockRegistrationDto = {
        ticket: 'VALE3',
        operation_date: new Date('2023-06-08'),
        value: 70,
        quantity: 300,
        tax: 20,
      };
      const { ticket, operation_date, value, quantity, tax } = stockDto;

      const createdStockRegistration = new StockRegistration();
      createdStockRegistration.ticket = ticket;
      createdStockRegistration.operation_date = operation_date;
      createdStockRegistration.value = value;
      createdStockRegistration.quantity = quantity;
      createdStockRegistration.tax = tax;
      createdStockRegistration.type = TypeStock.SALE;

      const correspondingPurchase = new Purchase();
      correspondingPurchase.quantity = 300;
      correspondingPurchase.status = StatusStock.OPEN;

      const savedPurchase = new Purchase();
      savedPurchase.quantity = 0;
      savedPurchase.status = STOCK_STATUS_CLOSE;

      const createdSale = new Sale();
      createdSale.type = TypeStock.SALE;
      createdSale.operation_date = operation_date;
      createdSale.ticket = ticket;
      createdSale.value = value;
      createdSale.quantity = 300;
      createdSale.tax = tax;
      createdSale.total_operation = value * 300 - tax;
      createdSale.purchase_ticket_id = correspondingPurchase;
      createdSale.irrf = IRRF_RATE * 300 * value;

      jest
        .spyOn(purchaseRepository, 'findOne')
        .mockResolvedValueOnce(correspondingPurchase);

      jest
        .spyOn(stockRegistrationRepository, 'create')
        .mockReturnValueOnce(createdStockRegistration);
      jest
        .spyOn(stockRegistrationRepository, 'save')
        .mockResolvedValue(createdStockRegistration);

      jest
        .spyOn(purchaseRepository, 'save')
        .mockResolvedValueOnce(correspondingPurchase);

      jest.spyOn(saleRepository, 'create').mockReturnValueOnce(createdSale);

      jest.spyOn(saleRepository, 'save').mockResolvedValue(createdSale);

      jest
        .spyOn(operationsService, 'createOperation')
        .mockResolvedValueOnce(null);

      await service.createStockSale(stockDto);

      expect(purchaseRepository.findOne).toHaveBeenCalledWith({
        where: { ticket: ticket, status: 'OPEN' },
        order: { operation_date: 'ASC' },
      });
      expect(stockRegistrationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createdStockRegistration,
          type: TypeStock.SALE,
        }),
      );
      expect(stockRegistrationRepository.save).toHaveBeenCalledWith(
        createdStockRegistration,
      );
      expect(purchaseRepository.save).toHaveBeenCalledWith(savedPurchase);
      expect(saleRepository.save).toHaveBeenCalledWith(createdSale);
      expect(operationsService.createOperation).toHaveBeenCalledWith(
        savedPurchase,
        createdSale,
      );
    });

    it('should throw an AppError when there is no corresponding purchase', async () => {
      const stockDto: StockRegistrationDto = {
        ticket: 'VALE3',
        operation_date: new Date('2023-06-08'),
        value: 70,
        quantity: 300,
        tax: 20,
      };

      jest
        .spyOn(purchaseRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      try {
        await service.createStockSale(stockDto);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe(
          'It was not possible to find a purchase with the corresponding ticket in the "Open" state',
        );
        expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an AppError when quantityExecuted is less than requested quantity', async () => {
      const stockDto: StockRegistrationDto = {
        ticket: 'VALE3',
        operation_date: new Date('2023-06-08'),
        value: 70,
        quantity: 500,
        tax: 20,
      };
      const { ticket, operation_date, value, quantity, tax } = stockDto;

      const createdStockRegistration = new StockRegistration();
      createdStockRegistration.ticket = ticket;
      createdStockRegistration.operation_date = operation_date;
      createdStockRegistration.value = value;
      createdStockRegistration.quantity = quantity;
      createdStockRegistration.tax = tax;
      createdStockRegistration.type = TypeStock.SALE;

      const correspondingPurchase = new Purchase();
      correspondingPurchase.quantity = 300;
      correspondingPurchase.status = StatusStock.OPEN;

      const savedPurchase = new Purchase();
      savedPurchase.quantity = 200;
      savedPurchase.status = 'OPEN';

      const createdSale = new Sale();
      createdSale.type = TypeStock.SALE;
      createdSale.operation_date = operation_date;
      createdSale.ticket = ticket;
      createdSale.value = value;
      createdSale.quantity = 300;
      createdSale.tax = tax;
      createdSale.total_operation = value * 300 - tax;
      createdSale.purchase_ticket_id = correspondingPurchase;
      createdSale.irrf = IRRF_RATE * 300 * value;

      jest
        .spyOn(purchaseRepository, 'findOne')
        .mockResolvedValueOnce(correspondingPurchase);

      jest
        .spyOn(stockRegistrationRepository, 'create')
        .mockReturnValueOnce(createdStockRegistration);
      jest
        .spyOn(stockRegistrationRepository, 'save')
        .mockResolvedValue(createdStockRegistration);

      jest
        .spyOn(purchaseRepository, 'save')
        .mockResolvedValueOnce(correspondingPurchase);

      jest
        .spyOn(operationsService, 'createOperation')
        .mockResolvedValueOnce(null);

      jest.spyOn(saleRepository, 'save').mockResolvedValueOnce(createdSale);

      try {
        await service.createStockSale(stockDto);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe(
          'It was possible to perform only 300 actions out of the 500 requested',
        );
        expect(error.statusCode).toBe(HttpStatus.PARTIAL_CONTENT);
      }
    });
  });

  describe('getCorrespondingPurchase', () => {
    it('should return the corresponding purchase with the specified ticket in "OPEN" status', async () => {
      const ticket = 'VALE3';

      const correspondingPurchase = new Purchase();
      correspondingPurchase.quantity = 100;
      correspondingPurchase.status = 'OPEN';

      jest
        .spyOn(purchaseRepository, 'findOne')
        .mockResolvedValue(correspondingPurchase);

      const result = await purchaseRepository.findOne({ where: { ticket } });

      expect(result).toEqual(correspondingPurchase);
    });

    it('should return undefined if no corresponding purchase is found', async () => {
      const ticket = 'VALE3';

      jest.spyOn(purchaseRepository, 'findOne').mockResolvedValue(undefined);

      const result = await purchaseRepository.findOne({ where: { ticket } });

      expect(result).toBeUndefined();
    });
  });
});
