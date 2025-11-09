import { IsString, IsOptional } from "class-validator";

export class VacationDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

