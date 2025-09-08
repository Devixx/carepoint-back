import { Module } from "@nestjs/common";
import { DoctorsController } from "./doctors.controller";
import { UsersModule } from "../users/users.module";
import { AppointmentsModule } from "../appointments/appointments.module";

@Module({
  imports: [UsersModule, AppointmentsModule],
  controllers: [DoctorsController],
})
export class DoctorsModule {}
