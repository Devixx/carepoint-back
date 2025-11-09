import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { DoctorsController } from "./doctors.controller"; // Correct path now
import { DoctorSettingsController } from "./doctor-settings.controller";
import { User } from "./entities/user.entity";
import { Appointment } from "../appointments/entities/appointment.entity";
import { Client } from "../clients/entities/client.entity";
import { AppointmentsService } from "../appointments/appointments.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Appointment, Client])],
  controllers: [UsersController, DoctorsController, DoctorSettingsController],
  providers: [UsersService, AppointmentsService],
  exports: [UsersService],
})
export class UsersModule {}
