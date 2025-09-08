import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AppointmentsModule } from "../appointments/appointments.module";
import { DoctorsController } from "../users/doctors.controller";

@Module({
  imports: [UsersModule, AppointmentsModule],
  controllers: [DoctorsController],
})
export class DoctorsModule {}
