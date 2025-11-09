import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { DoctorSettingsDto } from "./dto/doctor-settings.dto";

@Controller("doctor")
@UseGuards(JwtAuthGuard)
export class DoctorSettingsController {
  constructor(private readonly usersService: UsersService) {}

  @Get("settings")
  async getSettings(@Request() req) {
    const doctorId = req.user?.id || process.env.DEV_DOCTOR_ID;
    return this.usersService.getDoctorSettings(doctorId);
  }

  @Patch("settings")
  async updateSettings(
    @Request() req,
    @Body() settingsDto: DoctorSettingsDto,
  ) {
    const doctorId = req.user?.id || process.env.DEV_DOCTOR_ID;
    return this.usersService.updateDoctorSettings(doctorId, settingsDto);
  }
}

