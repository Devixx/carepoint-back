import { IsString, IsDateString, IsOptional, IsUUID } from "class-validator";

export class CreateAppointmentDto {
  @IsUUID()
  doctorUserId: string; // Add this field

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
}
