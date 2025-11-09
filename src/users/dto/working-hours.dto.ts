import { IsNumber, IsBoolean, IsOptional, IsString, Min, Max } from "class-validator";

export class WorkingHoursDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @IsString()
  startTime?: string; // HH:mm format

  @IsOptional()
  @IsString()
  endTime?: string; // HH:mm format

  @IsOptional()
  @IsString()
  breakStartTime?: string; // HH:mm format

  @IsOptional()
  @IsString()
  breakEndTime?: string; // HH:mm format
}

