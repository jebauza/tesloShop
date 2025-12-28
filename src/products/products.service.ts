import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/request/create-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ProductImage } from './entities/product-image.entity';
import { User } from '../auth/entities/user.entity';
import { handleDBException } from '../common/helpers/errors.helper';
import { ProductPaginationResponseDto } from './dto/response/product-pagination-response.dto';


@Injectable()
export class ProductsService {

  private readonly loggerName: string = 'ProductsService';
  private readonly defaultLimit: number = 10;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}

  
  async create(createProductDto: CreateProductDto, user: User) {

    let newProduct;
    const { images = [], ...productData } = createProductDto;
    
    try {
      newProduct = this.productsRepository.create({
        ...productData,
        images: images.map( url => this.productImagesRepository.create({ url }) ),
        user: user,
      });

      await this.productsRepository.save(newProduct);
      return { ...newProduct, images };
      
    } catch (error) {
      handleDBException(this.loggerName, error);
    }
  }

  async pagination(paginationDto: PaginationDto): Promise<ProductPaginationResponseDto> {
    const { offset = 0, limit = this.defaultLimit } = paginationDto;

    const [products, total] = await this.productsRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
      order: { title: 'ASC' },
    });

    const items = products.map(product => ({
      ...product,
      images: product.images ? product.images.map(img => img.url) : [],
    }));

    return { offset, limit, total, items };
  }

  async findOne(term: string): Promise<Product> {
    let product: Product | null = null;

    if (isUUID(term)) {
      product = await this.productsRepository.findOneBy({ id: term });
    } else {
      // product = await this.productsRepository.findOneBy({ slug: term });
      
      const queryBuilder = this.productsRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) = :title OR slug = :slug', {
          title: term.toUpperCase(),
          slug: term,
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with term '${term}' not found`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images, ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: (images ? images.map(img => img.url) : [])
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User): Promise<any> {
    const { images, ...toUpdate } = updateProductDto

    const product = await this.productsRepository.preload({ id, ...toUpdate });

    if (!product)
      throw new NotFoundException(`Product with id '${id}' not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {product: {id: product.id}});

        product.images = images.map(
          image => this.productImagesRepository.create({url: image})
        );
      }

      product.user = user;
      await queryRunner.manager.save(product);
      // await this.productsRepository.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      handleDBException(this.loggerName, error);
    }
  }

  async remove(id: string): Promise<void> {
    // const product = await this.findOne(id);
    // await this.productsRepository.remove(product);

    const { affected } = await this.productsRepository.delete(id);

    if (affected === 0) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }
  }

  async deleteAllProducts() {
    const query = this.productsRepository.createQueryBuilder('product');

    try {
      await query.delete().where({}).execute();
      
    } catch (error) {
      handleDBException(this.loggerName, error);
    }
  }
}
