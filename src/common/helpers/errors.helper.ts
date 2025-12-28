import { BadRequestException, InternalServerErrorException, Logger, } from '@nestjs/common';

export const handleDBException = (loggerName: string = 'Logger', error: any): never => {
  if (error.code === '23505') {
    throw new BadRequestException(error.detail);
  }

  new Logger(loggerName).error(error);
  throw new InternalServerErrorException('Internal server error');
};