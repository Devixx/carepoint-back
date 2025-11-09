import {
  IsString,
  IsDateString,
  IsOptional,
  IsUUID,
  IsNumber,
} from "class-validator";

export class CreateAppointmentDto {
  @IsUUID()
  doctorUserId: string; // Add this field

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  fee?: number;
}
