import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ClientsService } from "./clients.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("patients")
@UseGuards(JwtAuthGuard)
export class PatientsProfileController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get("profile")
  async getProfile(@Request() req) {
    const patientId = req.user.patientId || req.user.sub;
    return this.clientsService.findOne(patientId);
  }

  @Patch("profile")
  async updateProfile(
    @Request() req,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
  ) {
    const patientId = req.user.patientId || req.user.sub;
    return this.clientsService.updateProfile(patientId, updateProfileDto);
  }
}
