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

const STOCK_STATUS_CLOSE = StatusStock.CLOSE;
const STOCK_STATUS_OPEN = StatusStock.OPEN;

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
    const stockDto: StockRegistrationDto = {
      ticket: 'VALE3',
      operation_date: new Date('2023-06-08'),
      value: 70,
      quantity: 300,
      tax: 20,
    };

    it(`should create a stock sale and update corresponding purchase when 
    a matching purchase exists`, async () => {
      const correspondingPurchase = new Purchase();
      correspondingPurchase.quantity = 300;
      correspondingPurchase.status = STOCK_STATUS_OPEN;

      const createdSale = new Sale();
      createdSale.type = TypeStock.SALE;
      createdSale.operation_date = new Date('2023-06-08');
      createdSale.ticket = stockDto.ticket;
      createdSale.value = stockDto.value;
      createdSale.quantity = correspondingPurchase.quantity;
      createdSale.tax = stockDto.tax;
      createdSale.total_operation =
        stockDto.value * correspondingPurchase.quantity - stockDto.tax;
      createdSale.purchase_ticket_id = correspondingPurchase;
      createdSale.irrf =
        0.00005 * correspondingPurchase.quantity * stockDto.value;

      jest
        .spyOn(purchaseRepository, 'find')
        .mockResolvedValue([correspondingPurchase]);

      jest
        .spyOn(purchaseRepository, 'findOne')
        .mockResolvedValueOnce(correspondingPurchase);

      jest.spyOn(saleRepository, 'create').mockReturnValueOnce({
        ...createdSale,
        type: TypeStock.SALE,
      });

      jest.spyOn(saleRepository, 'save').mockResolvedValue(createdSale);

      jest
        .spyOn(purchaseRepository, 'save')
        .mockResolvedValueOnce(correspondingPurchase);

      jest
        .spyOn(stockRegistrationRepository, 'create')
        .mockReturnValueOnce(createdSale);
      jest
        .spyOn(stockRegistrationRepository, 'save')
        .mockResolvedValue(createdSale);

      jest
        .spyOn(operationsService, 'createOperation')
        .mockResolvedValueOnce(null);

      await service.createStockSale(stockDto);

      expect(purchaseRepository.findOne).toHaveBeenCalledWith({
        where: { ticket: 'VALE3', status: STOCK_STATUS_OPEN },
        order: { operation_date: 'ASC' },
      });

      expect(saleRepository.save).toHaveBeenCalledWith(createdSale);
      expect(createdSale.total_operation).toBe(20980);
      expect(createdSale.irrf).toBe(1.05);

      expect(purchaseRepository.save).toHaveBeenCalledWith(
        correspondingPurchase,
      );
      expect(correspondingPurchase.quantity).toBe(0);
      expect(correspondingPurchase.status).toBe(STOCK_STATUS_CLOSE);

      expect(stockRegistrationRepository.save).toHaveBeenCalledWith(
        createdSale,
      );

      expect(operationsService.createOperation).toHaveBeenCalledWith(
        correspondingPurchase,
        createdSale,
        21000,
      );
    });

    it('should throw an AppError when there is no corresponding purchase', async () => {
      jest.spyOn(purchaseRepository, 'find').mockResolvedValue([]);

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
      const correspondingPurchase = new Purchase();
      correspondingPurchase.quantity = 200;
      correspondingPurchase.status = STOCK_STATUS_OPEN;

      const createdSale = new Sale();

      jest
        .spyOn(purchaseRepository, 'find')
        .mockResolvedValue([correspondingPurchase]);

      jest
        .spyOn(purchaseRepository, 'findOne')
        .mockResolvedValueOnce(correspondingPurchase);

      jest
        .spyOn(stockRegistrationRepository, 'create')
        .mockReturnValueOnce(createdSale);
      jest
        .spyOn(stockRegistrationRepository, 'save')
        .mockResolvedValue(createdSale);

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
          'It was possible to perform only 200 actions out of the 300 requested',
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
      correspondingPurchase.status = STOCK_STATUS_OPEN;

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
