import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { OperationsService } from '../services/operations.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Calculated Operations')
@Controller('operations')
export class OperationsController {
  constructor(private operationsService: OperationsService) {}

  @Get()
  async getAllOperations(@Res() res: Response) {
    const operations = await this.operationsService.getOperations();

    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('/:ticket')
  async getOperationsByTicket(
    @Res() res: Response,
    @Param('ticket') ticket: string,
  ) {
    const operations = await this.operationsService.getOperationsByTicket(
      ticket,
    );

    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('/period/:year')
  async getOperationsByYear(@Res() res: Response, @Param('year') year: number) {
    const operations = await this.operationsService.getOperationsByYear(year);
    return res.status(HttpStatus.OK).json(operations);
  }

  @Get('/period/:year/:month')
  async getOperationsByYearAndMonth(
    @Res() res: Response,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    const operations = await this.operationsService.getOperationsByYearAndMonth(
      year,
      month,
    );
    return res.status(HttpStatus.OK).json(operations);
  }
}
