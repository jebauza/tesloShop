import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import dataSource from 'src/data-source';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async runSeed() {
    await this.deleteTables();

    const firstUser = await this.insertNewUsers();
    await this.insertNewProducts(firstUser);

    return 'SEED EXECUTED';
  }

  private async deleteTables() {
    // Products
    await this.productsService.deleteAllProducts();
    console.log('pase');

    // Users
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach( seedUser => {
      users.push( this.userRepository.create({
        ...seedUser,
        password: bcrypt.hashSync(seedUser.password, 10)
      }));
    });

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    const products = initialData.products;
    const insertPromises: Promise<any>[] = [];

    products.forEach(product => {
      insertPromises.push(this.productsService.create(product, user));
    });

    const results = await Promise.all(insertPromises);

    return true;
  }

  async checkDataSource() {
    await dataSource.initialize();
    console.log('Conexión OK');
    await dataSource.destroy();
  }
}
