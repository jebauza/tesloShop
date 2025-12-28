import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';
import { PaginationResponseDto } from '../../../common/dto/response/pagination-response.dto';

export class ProductPaginationResponseDto extends PaginationResponseDto<ProductResponseDto> {
  @ApiProperty({ type: [ProductResponseDto], description: 'Lista de productos de la página actual' })
  declare items: ProductResponseDto[];

  // Si quieres agregar campos extra solo para productos, puedes agregarlos aquí
  // @ApiProperty({ description: 'Ejemplo de campo extra específico para productos' })
  // extraInfo?: string;
}
