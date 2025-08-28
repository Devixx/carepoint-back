import {
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
import {
  AppointmentStatus,
  AppointmentType,
} from "../entities/appointment.entity";

export class CreateAppointmentDto {
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsUUID()
  patientId: string;
}
