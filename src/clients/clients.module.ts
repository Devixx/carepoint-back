import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";
import { Client } from "./entities/client.entity";
import { PatientsAppointmentsController } from "./patients-appointments.controller";
import { AppointmentsService } from "../appointments/appointments.service";
import { AppointmentsModule } from "../appointments/appointments.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    forwardRef(() => AppointmentsModule),
  ],
  providers: [ClientsService],
  controllers: [ClientsController, PatientsAppointmentsController],
  exports: [ClientsService, TypeOrmModule],
})
export class ClientsModule {}
