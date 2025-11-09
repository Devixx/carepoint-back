import { IsString, IsNumber, IsOptional, Min } from "class-validator";

export class ConsultationTypeDto {
  @IsString()
  type: string;

  @IsNumber()
  @Min(5)
  duration: number; // in minutes

  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;
}

