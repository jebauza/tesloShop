import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductImage } from './entities/product-image.entity';
// import { isUUID } from 'src/common/utils/uuid';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  private readonly defaultLimit: number = 10;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}

  
  async create(createProductDto: CreateProductDto): Promise<any> {

    let newProduct;
    const { images = [], ...productData } = createProductDto;
    
    try {
      newProduct = this.productsRepository.create({
        ...productData,
        images: images.map( url => this.productImagesRepository.create({ url }) ),
      });

      await this.productsRepository.save(newProduct);
      return { ...newProduct, images };
      
    } catch (error) {
      this.handleDataBaseException(error);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<any[]> {
    const { offset = 0, limit = this.defaultLimit } = paginationDto;

    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
      order: { title: 'ASC' },
    });

    return products.map((product) => ({
      ...product,
      images: (product.images ? product.images.map(img => img.url) : []) 
    }));
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

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
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

      await queryRunner.manager.save(product);
      // await this.productsRepository.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDataBaseException(error);
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
      this.handleDataBaseException(error);
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
