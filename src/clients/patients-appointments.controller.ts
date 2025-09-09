import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AppointmentsService } from "../appointments/appointments.service";
import { AppointmentStatus } from "../appointments/entities/appointment.entity";

@Controller("patients")
@UseGuards(JwtAuthGuard)
export class PatientsAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get("appointments")
  async getPatientAppointments(
    @Request() req,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("status") status?: AppointmentStatus,
    @Query("start") start?: string,
    @Query("end") end?: string,
  ) {
    console.log("Request user:", req.user); // Debug log

    // Ensure this is a patient making the request
    if (!req.user || req.user.type !== "patient") {
      console.error("Access denied - not a patient:", req.user);
      throw new ForbiddenException("Access denied - patients only");
    }

    const patientId = req.user.patientId || req.user.id;
    console.log("Patient ID:", patientId); // Debug log

    return this.appointmentsService.listByPatient(
      patientId,
      { page: Number(page), limit: Number(limit) },
      { status, start, end },
    );
  }
}
