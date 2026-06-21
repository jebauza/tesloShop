import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_product_images_id',
  })
  id: number;

  @Column('varchar', {
    name: 'url',
    length: 255,
  })
  url: string;

  @Index('IDX_product_images_user_id')
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_product_images_product_id',
  })
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
