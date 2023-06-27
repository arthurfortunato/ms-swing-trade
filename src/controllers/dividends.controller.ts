import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DividendsDto } from '../dtos/dividends.dto';
import { TypeDividends } from '../enums/type-dividends.enum';
import { DividendsService } from '../services/dividends.service';

@ApiTags('Dividends record')
@Controller('dividends-registration')
export class DividendsController {
  constructor(private dividendsService: DividendsService) {}

  @Post('dividends')
  @UsePipes(ValidationPipe)
  async createDividends(
    @Body() createDividendsDto: DividendsDto,
    @Res() res: Response,
  ) {
    createDividendsDto.type = TypeDividends.DIVIDENDS;
    await this.dividendsService.createDividends(createDividendsDto);

    return res
      .status(HttpStatus.CREATED)
      .send({ message: 'Dividends registered successfully!' });
  }

  @Post('jrc')
  @UsePipes(ValidationPipe)
  async createJRC(
    @Body() createDividendsDto: DividendsDto,
    @Res() res: Response,
  ) {
    createDividendsDto.type = TypeDividends.JRC;
    await this.dividendsService.createJRC(createDividendsDto);

    return res
      .status(HttpStatus.CREATED)
      .send({ message: 'JRC registered successfully!' });
  }

  @Get()
  async getAllDividends(@Res() res: Response) {
    const operations = await this.dividendsService.getAllDividends();

    return res.status(HttpStatus.OK).json(operations);
  }
}
