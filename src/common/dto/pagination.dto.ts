import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    offset?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    limit?: number;
}