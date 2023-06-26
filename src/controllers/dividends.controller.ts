import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DividendsDto } from 'src/dtos/dividends.dto';
import { TypeDividends } from 'src/enums/type-dividends.enum';
import { DividendsService } from 'src/services/dividends.service';

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
    await this.dividendsService.createDividends(createDividendsDto);

    return res
      .status(HttpStatus.CREATED)
      .send({ message: 'JRC registered successfully!' });
  }
}
