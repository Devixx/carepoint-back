import { Controller, Get, Param, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AppointmentsService } from "../appointments/appointments.service";
import { UserRole } from "./entities/user.entity";

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
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
    @Query("radius") radius?: string,
    @Query("city") city?: string,
  ) {
    const filters = { specialty, search };

    // Location-based search (geolocation)
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusKm = radius ? parseFloat(radius) : 50;

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        return this.usersService.findDoctorsNearby(latNum, lngNum, radiusKm, filters);
      }
    }

    // City-based search
    if (city) {
      return this.usersService.findDoctorsByCity(city, filters);
    }

    // Default: return all doctors
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
