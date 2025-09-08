import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AppointmentsService } from "../appointments/appointments.service";

@Controller("doctors")
@UseGuards(JwtAuthGuard)
export class DoctorsAvailabilityController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get(":id/availability")
  async getAvailability(
    @Param("id") doctorId: string,
    @Query("date") date: string,
  ) {
    return this.appointmentsService.getAvailabilityForDoctor(doctorId, date);
  }
}
