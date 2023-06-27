import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dividends } from '../entities/dividends.entity';
import { TypeDividends } from '../enums/type-dividends.enum';
import { AppError } from '../error/AppError';
import { DividendsService } from '../services/dividends.service';

describe('DividendsService', () => {
  let service: DividendsService;
  let dividendsRepository: Repository<Dividends>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DividendsService,
        {
          provide: getRepositoryToken(Dividends),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DividendsService>(DividendsService);
    dividendsRepository = module.get<Repository<Dividends>>(
      getRepositoryToken(Dividends),
    );
  });

  describe('createDividends', () => {
    it('should create a new dividends', async () => {
      const dividendsDto = {
        type: TypeDividends.DIVIDENDS,
        payment_date: new Date('2023-05-17'),
        ticket: 'CMIN3',
        rate: 0.2825714228,
        quantity: 3000,
      };

      const createDividends = new Dividends();
      createDividends.type = dividendsDto.type;
      createDividends.payment_date = dividendsDto.payment_date;
      createDividends.ticket = dividendsDto.ticket;
      createDividends.rate = dividendsDto.rate;
      createDividends.quantity = dividendsDto.quantity;

      jest
        .spyOn(dividendsRepository, 'create')
        .mockReturnValue(createDividends);
      jest
        .spyOn(dividendsRepository, 'save')
        .mockResolvedValue(createDividends);

      const result = await service.createDividends(dividendsDto);

      expect(dividendsRepository.create).toHaveBeenCalledWith({
        ...dividendsDto,
        total: dividendsDto.rate * dividendsDto.quantity,
      });
      expect(dividendsRepository.save).toHaveBeenCalledWith(createDividends);
      expect(result).toEqual(createDividends);
    });

    it('should throw an AppError if an error occurs during the process', async () => {
      const dividendsDto = {
        type: TypeDividends.DIVIDENDS,
        payment_date: new Date('2023-05-17'),
        ticket: 'CMIN3',
        rate: 0.2825714228,
        quantity: 3000,
      };

      jest.spyOn(dividendsRepository, 'create').mockImplementation(() => {
        throw new Error('Error registered dividends');
      });

      try {
        await service.createDividends(dividendsDto);
        fail('Expected an AppError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('Error registered dividends');
        expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    describe('getAllDividends', () => {
      it('should return an array of dividends', async () => {
        const dividends = [new Dividends(), new Dividends()];

        jest.spyOn(dividendsRepository, 'find').mockResolvedValue(dividends);

        const result = await service.getAllDividends();

        expect(dividendsRepository.find).toHaveBeenCalled();
        expect(result).toEqual(dividends);
      });

      it('should throw an AppError if no dividends are found', async () => {
        jest.spyOn(dividendsRepository, 'find').mockResolvedValue([]);

        try {
          await service.getAllDividends();
          fail('Expected an AppError to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          expect(error.message).toBe('No dividends found');
          expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
        }
      });
    });
  });
});
