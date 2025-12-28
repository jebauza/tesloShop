import {
    ArrayNotEmpty,
    IsArray,
    IsIn,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {

    @ApiProperty({
        description: 'Product title',
        example: 'Camiseta deportiva',
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiPropertyOptional({
        description: 'Product price',
        example: 29.99,
        type: Number,
        required: false,
        minimum: 0,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiPropertyOptional({
        description: 'Product description',
        required: false,
        example: 'Camiseta de alta calidad para entrenamiento',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Unique slug for the product (optional)',
        example: 'camiseta-deportiva',
        required: false,
        minLength: 3,
    })
    @IsString()
    @MinLength(3)
    @IsOptional()
    slug?: string;

    @ApiPropertyOptional({
        description: 'Stock available',
        example: 100,
        type: Number,
        required: false,
        minimum: 0,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        description: 'Available sizes',
        type: [String],
        example: ['S', 'M', 'L', 'XL'],
    })
    @IsString({ each: true })
    @IsArray()
    @ArrayNotEmpty()
    sizes: string[];

    @ApiProperty({
        description: 'Gender target',
        enum: ['men', 'women', 'kid', 'unisex'],
        example: 'men',
    })
    @IsString()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty({
        description: 'Tags for searching/filtering',
        type: [String],
        required: false,
        example: ['shirt', 'sport'],
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiPropertyOptional({
        description: 'Image URLs (optional)',
        type: [String],
        required: false,
        example: ['http://example.com/img1.jpg', 'http://example.com/img2.jpg'],
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];
}