import { Controller, Get, Param, Query } from "@nestjs/common";
import { AppointmentsService } from "../appointments/appointments.service";

@Controller("doctors")
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
