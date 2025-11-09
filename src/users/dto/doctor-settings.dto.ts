import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { DoctorProfileDto } from "./doctor-profile.dto";
import { WorkingHoursDto } from "./working-hours.dto";
import { AppointmentSettingsDto } from "./appointment-settings.dto";
import { VacationDto } from "./vacation.dto";

export class DoctorSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DoctorProfileDto)
  profile?: DoctorProfileDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentSettingsDto)
  appointmentSettings?: AppointmentSettingsDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VacationDto)
  vacations?: VacationDto[];
}

