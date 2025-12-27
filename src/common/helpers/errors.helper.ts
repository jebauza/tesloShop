import { BadRequestException, InternalServerErrorException, } from '@nestjs/common';

export const handleDBErrors = (error: any): never => {
  if (error.code === '23505') {
    throw new BadRequestException(error.detail);
  }

  throw new InternalServerErrorException('Internal server error');
};