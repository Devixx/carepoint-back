import { Controller, Get, Param, Query } from "@nestjs/common";
import { UsersService } from "./users.service"; // Correct path
import { AppointmentsService } from "../appointments/appointments.service";
import { UserRole } from "./entities/user.entity"; // Correct path

@Controller("doctors")
export class DoctorsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  @Get()
  async findAllDoctors(
    @Query("specialty") specialty?: string,
    @Query("search") search?: string,
  ) {
    const users = await this.usersService.findAll();

    // Filter for doctors only
    let doctors = users.filter((user) => user.role === UserRole.DOCTOR);

    // Filter by specialty
    if (specialty) {
      doctors = doctors.filter((doctor) =>
        doctor.specialty?.toLowerCase().includes(specialty.toLowerCase()),
      );
    }

    // Filter by search term
    if (search) {
      doctors = doctors.filter(
        (doctor) =>
          doctor.firstName.toLowerCase().includes(search.toLowerCase()) ||
          doctor.lastName.toLowerCase().includes(search.toLowerCase()) ||
          doctor.specialty?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return doctors;
  }

  @Get(":id")
  findOneDoctor(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Get(":id/availability")
  getAvailability(@Param("id") doctorId: string, @Query("date") date: string) {
    return this.appointmentsService.getAvailabilityForDoctor(doctorId, date);
  }
}
