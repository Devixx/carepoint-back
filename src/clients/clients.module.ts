import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "./entities/client.entity";
import { Appointment } from "../appointments/entities/appointment.entity";
import { User } from "../users/entities/user.entity";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";
import { PatientsProfileController } from "./patients-profile.controller";
import { PatientsAppointmentsController } from "./patients-appointments.controller";
import { AppointmentsService } from "../appointments/appointments.service";
import { AuthService } from "../auth/auth.service"; // Add this
import { JwtService } from "@nestjs/jwt"; // Add this

@Module({
  imports: [TypeOrmModule.forFeature([Client, Appointment, User])],
  controllers: [
    ClientsController,
    PatientsProfileController,
    PatientsAppointmentsController,
  ],
  providers: [
    ClientsService,
    AppointmentsService,
    AuthService, // Add this
    JwtService, // Add this
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
