// src/appointments/dto/appointments-filter.dto.ts
import { Type } from "class-transformer";
import { IsISO8601, IsOptional } from "class-validator";

export class AppointmentsFilterDto {
  @IsOptional()
  @IsISO8601()
  start?: string; // ISO datetime

  @IsOptional()
  @IsISO8601()
  end?: string; // ISO datetime
}
