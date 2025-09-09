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
    console.log("👤 Profile Controller - Request user:", {
      id: req.user?.id,
      email: req.user?.email,
      type: req.user?.type,
      patientId: req.user?.patientId,
    });

    if (!req.user || req.user.type !== "patient") {
      throw new Error("Access denied - patients only");
    }

    const patientId = req.user.patientId || req.user.id;
    console.log("👤 Fetching profile for patient ID:", patientId);

    return this.clientsService.findOne(patientId);
  }

  @Patch("profile")
  async updateProfile(
    @Request() req,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
  ) {
    console.log("✏️ Update Profile - Request user:", {
      id: req.user?.id,
      email: req.user?.email,
      type: req.user?.type,
      patientId: req.user?.patientId,
    });

    if (!req.user || req.user.type !== "patient") {
      throw new Error("Access denied - patients only");
    }

    const patientId = req.user.patientId || req.user.id;
    console.log("✏️ Updating profile for patient ID:", patientId);

    return this.clientsService.updateProfile(patientId, updateProfileDto);
  }
}
