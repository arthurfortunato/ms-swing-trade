import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';
import { DividendsController } from '../controllers/dividends.controller';
import { Repository } from 'typeorm';
import { Dividends } from '../entities/dividends.entity';
import { TypeDividends } from '../enums/type-dividends.enum';
import { DividendsService } from '../services/dividends.service';

describe('DividendsService', () => {
  let controller: DividendsController;
  let dividendsService: DividendsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DividendsController],
      providers: [
        DividendsService,
        {
          provide: getRepositoryToken(Dividends),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<DividendsController>(DividendsController);
    dividendsService = module.get<DividendsService>(DividendsService);
  });

  describe('createDividends', () => {
    it('should create a new dividends', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

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
        .spyOn(dividendsService, 'createDividends')
        .mockResolvedValue(createDividends);

      await controller.createDividends(createDividends, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(dividendsService.createDividends).toHaveBeenCalledWith(
        createDividends,
      );
      expect(response.send).toHaveBeenCalledWith({
        message: 'Dividends registered successfully!',
      });
    });

    it('should create a new jrc', async () => {
      const response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const dividendsDto = {
        type: TypeDividends.JRC,
        payment_date: new Date('2023-05-17'),
        ticket: 'CMIN3',
        rate: 0.2825714228,
        quantity: 3000,
      };

      const createJRC = new Dividends();
      createJRC.type = dividendsDto.type;
      createJRC.payment_date = dividendsDto.payment_date;
      createJRC.ticket = dividendsDto.ticket;
      createJRC.rate = dividendsDto.rate;
      createJRC.quantity = dividendsDto.quantity;

      jest
        .spyOn(dividendsService, 'createJRC')
        .mockResolvedValue(createJRC);

      await controller.createJRC(createJRC, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(dividendsService.createJRC).toHaveBeenCalledWith(
        createJRC,
      );
      expect(response.send).toHaveBeenCalledWith({
        message: 'JRC registered successfully!',
      });
    });
  });
});
