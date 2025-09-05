import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  private readonly defaultLimit: number = 10;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);

    try {
      await this.productsRepository.save(product);
      
    } catch (error) {
      this.handleDataBaseException(error);
    }

    return product;
  }

  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { offset = 0, limit = this.defaultLimit } = paginationDto;

    return await this.productsRepository.find({
      take: limit,
      skip: offset,
      order: { title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    let product: Product | null = null;

    product = await this.productsRepository.findOneBy({ id });

    if (!product)
      throw new NotFoundException(`Product with id '${id}' not found`);

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string): Promise<void> {
    // const product = await this.findOne(id);
    // await this.productsRepository.remove(product);

    const { affected } = await this.productsRepository.delete(id);

    if (affected === 0) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }
  }

  private handleDataBaseException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
