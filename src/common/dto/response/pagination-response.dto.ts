import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  @ApiProperty({ description: 'The number of items to skip before starting to collect the result set', example: 1 })
  offset: number;

  @ApiProperty({ description: 'The maximum number of items to return', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 50 })
  total: number;

  @ApiProperty({ isArray: true, description: 'List of items on the current page' })
  items: T[];
}
