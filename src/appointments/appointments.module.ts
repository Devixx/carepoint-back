import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsController } from "./appointments.controller";
import { Appointment } from "./entities/appointment.entity";
import { User } from "../users/entities/user.entity";
import { Client } from "../clients/entities/client.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User, Client])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
