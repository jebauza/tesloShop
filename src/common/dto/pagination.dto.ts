import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    offset?: number;
}