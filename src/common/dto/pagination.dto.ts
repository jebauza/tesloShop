import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    @ApiProperty({default: 0, description: 'Number of items to skip'})
    offset?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    @ApiProperty({default: 10, description: 'Number of items to return'})
    limit?: number;
}