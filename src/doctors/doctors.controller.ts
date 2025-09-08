import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "../users/users.service";
import { UserRole } from "../users/entities/user.entity";
import { AppointmentsService } from "../appointments/appointments.service";

@Controller("doctors")
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  // GET /doctors?specialty=Cardiology&search=emily
  @Get()
  async list(
    @Query("specialty") specialty?: string,
    @Query("search") search?: string,
  ) {
    return this.usersService.findByRoleAndFilters(UserRole.DOCTOR, {
      specialty,
      search,
    });
  }

  // GET /doctors/:id
  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.usersService.findOneDoctorPublic(id);
  }

  // GET /doctors/:id/availability?date=2025-09-06
  @Get(":id/availability")
  async availability(@Param("id") id: string, @Query("date") date: string) {
    return this.appointmentsService.getAvailabilityForDoctor(id, date);
  }
}
