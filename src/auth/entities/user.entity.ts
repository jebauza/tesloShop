import { Product } from './../../products/entities/product.entity';
import { encryptTransformer } from '../../common/transformers/encrypt.transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_users_id',
  })
  id: string;

  @Index('UQ_users_email', { unique: true })
  @Column('varchar', { name: 'email', length: 100 })
  email: string;

  @Column('varchar', {
    name: 'password',
    length: 255,
    select: false,
  })
  password: string;

  @Index('IDX_users_full_name')
  @Column('varchar', { name: 'full_name', length: 255 })
  fullname: string;

  @Column('varchar', { name: 'document_type', length: 100, nullable: true })
  documentType: string;

  // PII cifrada en BD con AES-256-GCM; se descifra automáticamente al leer
  @Column('text', {
    name: 'document',
    transformer: encryptTransformer,
    nullable: true,
  })
  document: string;

  @Column('boolean', {
    name: 'is_active',
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    name: 'roles',
    array: true,
    default: ['user'],
  })
  roles: string[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
