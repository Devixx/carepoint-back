// src/common/dto/pagination-query.dto.ts
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  sort?: string; // e.g. 'createdAt' or 'startTime'

  @IsOptional()
  @IsIn(["ASC", "DESC"])
  order: "ASC" | "DESC" = "DESC";

  @IsOptional()
  @IsString()
  search?: string;
}
