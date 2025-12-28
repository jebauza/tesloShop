import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/request/create-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ProductsService } from './products.service';
import { ProductResponseDto } from './dto/response/product-response.dto';
import { ProductPaginationResponseDto } from './dto/response/product-pagination-response.dto';

@Controller('products')
// @Auth()
@UseInterceptors(ClassSerializerInterceptor) // To enable @Exclude() and @Expose() Respounse transformation
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth(/* ValidRoles.admin */)
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ description: 'Created', type: ProductResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request', example: { statusCode: 400, message: '...', error: 'Bad Request' } })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ): Promise<ProductResponseDto> {
    return new ProductResponseDto(await this.productsService.create(createProductDto, user));
  }

  @Get()
  // @ApiQuery({
  //   name: 'offset',
  //   required: false,
  //   description: 'The number of items to skip before starting to collect the result set. Defaults to 0.',
  //   example: '1',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'The maximum number of items to return. Defaults to 10',
  //   example: '10',
  // })
  @ApiOkResponse({ description: 'OK', type: ProductPaginationResponseDto })
  @ApiBadRequestResponse({ description: 'Bad Request', example: { statusCode: 400, message: '...', error: 'Bad Request' } })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  pagination(@Query() paginationDto: PaginationDto): Promise<ProductPaginationResponseDto> {
    return this.productsService.pagination(paginationDto);
  }

  @Get(':term')
  @ApiParam({
    name: 'term',
    description: 'Product ID or slug',
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
  })
  @ApiOkResponse({ description: 'OK', type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findOne(@Param('term') term: string): Promise<ProductResponseDto> {
    return new ProductResponseDto(await this.productsService.findOne(term));
  }

  @Patch(':id')
  @Auth(/* ValidRoles.admin */)
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({ description: 'OK', type: ProductResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request', example: { statusCode: 400, message: '...', error: 'Bad Request' } })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ): Promise<ProductResponseDto> {
    return new ProductResponseDto(await this.productsService.update(id, updateProductDto, user));
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
  })
  @ApiOkResponse({ description: 'OK'})
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
