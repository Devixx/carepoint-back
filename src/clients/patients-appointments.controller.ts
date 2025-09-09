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
    console.log("🏥 Patient Appointments Controller");
    console.log("📋 Request user:", {
      id: req.user?.id,
      email: req.user?.email,
      type: req.user?.type,
      patientId: req.user?.patientId,
    });

    // Ensure this is a patient making the request
    if (!req.user || req.user.type !== "patient") {
      console.error("❌ Access denied - not a patient:", req.user?.type);
      throw new ForbiddenException("Access denied - patients only");
    }

    const patientId = req.user.patientId || req.user.id;
    console.log("👤 Using patient ID:", patientId);

    try {
      const result = await this.appointmentsService.listByPatient(
        patientId,
        { page: Number(page), limit: Number(limit) },
        { status, start, end },
      );

      console.log("✅ Appointments retrieved:", result.items?.length || 0);
      return result;
    } catch (error) {
      console.error("❌ Error retrieving appointments:", error);
      throw error;
    }
  }
}
