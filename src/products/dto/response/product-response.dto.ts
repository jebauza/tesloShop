import { Expose, Exclude, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class ProductResponseDto {

  constructor(product: any) {
    Object.assign(this, product);
  }

  @ApiProperty({
    description: 'Product UUID',
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    uniqueItems: true,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Product title',
    example: 'Camiseta deportiva',
    uniqueItems: true,
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Product price',
    example: 1.99,
    type: Number,
  })
  @Exclude()
  price: number;

  @ApiProperty({
    description: 'Product description',
    required: false,
    example: 'lorem ipsum dolor sit amet',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Unique slug for the product',
    example: 'camiseta-deportiva',
    uniqueItems: true,
  })
  @Expose()
  slug: string;

  @ApiProperty({
    description: 'Stock available',
    example: 100,
    type: Number,
  })
  @Expose()
  stock: number;

  @ApiProperty({
    description: 'Available sizes',
    type: [String],
    example: ['S', 'M', 'L', 'XL'],
  })
  @Expose()
  sizes: string[];

  @ApiProperty({
    description: 'Gender target',
    enum: ['men', 'women', 'kid', 'unisex'],
    example: 'men',
  })
  @Expose()
  gender: string;

  @ApiProperty({
    description: 'Tags for searching/filtering',
    type: [String],
    example: ['sport', 'summer'],
  })
  @Expose()
  tags: string[];

  @ApiProperty({
    description: 'Image URLs',
    type: [String],
    example: ['http://.../img1.jpg', 'http://.../img2.jpg'],
  })
  @Expose({ name: 'imgs' })
  @Transform(({ obj }) => (obj.images ?? []).map((img: any) => img.url))
  images: string[];

  @ApiProperty({
    description: 'Owner user (id and email)',
    required: false,
    type: Object,
    example: { id: 'user-uuid-123', email: 'user@example.com' },
  })
  @Expose()
  @Transform(({ obj }) =>
    obj.user ? { id: obj.user.id, email: obj.user.email } : undefined,
  )
  user?: { id: string; email: string };
}
