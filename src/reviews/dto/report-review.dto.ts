import { IsString, MinLength } from "class-validator";

export class ReportReviewDto {
  @IsString()
  @MinLength(10)
  reason: string;
}
