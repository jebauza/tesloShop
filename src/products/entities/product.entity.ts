import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_products_id',
  })
  id: string;

  @Index('UQ_products_title', { unique: true })
  @Column('varchar', {
    name: 'title',
    length: 100,
  })
  title: string;

  @Column('float', {
    name: 'price',
    default: 0,
  })
  price: number;

  @Column('text', {
    name: 'description',
    nullable: true,
  })
  description: string;

  @Index('UQ_products_slug', { unique: true })
  @Column('varchar', {
    name: 'slug',
    length: 255,
  })
  slug: string;

  @Column('smallint', {
    name: 'stock',
    default: 0,
  })
  stock: number;

  @Column('text', {
    name: 'sizes',
    array: true,
  })
  sizes: string[];

  @Column('varchar', {
    name: 'gender',
  })
  gender: string;

  @Column('text', {
    name: 'tags',
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true, // importante para guardar automáticamente imágenes
    eager: true, // opcional, para traer imágenes en find()
  })
  images?: ProductImage[];

  @Index('IDX_products_user_id')
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_products_user_id',
  })
  @ManyToOne(() => User, (user) => user.products, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    const slug = this.slug || this.title;

    this.slug = slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }
}
