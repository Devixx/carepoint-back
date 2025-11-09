import { IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min } from "class-validator";
import { Type } from "class-transformer";
import { ConsultationTypeDto } from "./consultation-type.dto";

export class AppointmentSettingsDto {
  @IsNumber()
  @Min(5)
  defaultDuration: number; // in minutes

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultFee?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsultationTypeDto)
  consultationTypes?: ConsultationTypeDto[];

  @IsOptional()
  @IsNumber()
  @Min(5)
  timeSlotInterval?: number; // in minutes (e.g., 15, 30)

  @IsOptional()
  @IsNumber()
  @Min(1)
  advanceBookingDays?: number; // how many days in advance patients can book

  @IsOptional()
  @IsBoolean()
  sameDayBooking?: boolean;
}

