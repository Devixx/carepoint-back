import { IsInt, IsString, IsOptional, IsUUID, Min, Max } from "class-validator";

export class CreateReviewDto {
  @IsUUID()
  doctorId: string;

  @IsUUID()
  appointmentId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
