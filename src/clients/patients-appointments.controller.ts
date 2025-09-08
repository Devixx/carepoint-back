import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AppointmentsService } from "../appointments/appointments.service";

class PatientAppointmentsQueryDto {
  page?: number;
  limit?: number;
  start?: string; // YYYY-MM-DD optional
  end?: string; // YYYY-MM-DD optional
  status?:
    | "scheduled"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  sort?: "startTime" | "createdAt";
  order?: "ASC" | "DESC";
}

@Controller("patients")
@UseGuards(JwtAuthGuard)
export class PatientsAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // GET /patients/appointments
  @Get("appointments")
  async listMyAppointments(
    @Request() req: any,
    @Query() query: PatientAppointmentsQueryDto,
  ) {
    // req.user should be the authenticated user; map to patient id in your auth layer if needed
    // If your auth stores patientId on req.user, prefer that. Otherwise, derive by email or map in login.
    const patientId = req.user?.patientId || req.user?.id;

    return this.appointmentsService.listByPatient(
      patientId,
      {
        page: Number(query.page) || 1,
        limit: Math.min(Number(query.limit) || 20, 100),
        sort: query.sort || "startTime",
        order: query.order || "ASC",
      },
      {
        start: query.start,
        end: query.end,
        status: query.status,
      },
    );
  }
}
