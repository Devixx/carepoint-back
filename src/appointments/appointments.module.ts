import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsController } from "./appointments.controller";
// If you use ClientsService or User repository in AppointmentsService:
import { ClientsModule } from "../clients/clients.module";
import { UsersModule } from "../users/users.module";
import { Client } from "../clients/entities/client.entity";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Client, User]),
    ClientsModule,
    UsersModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
