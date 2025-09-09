import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeedService } from "./seed.service";
import { User } from "../users/entities/user.entity";
import { Client } from "../clients/entities/client.entity";
import { Appointment } from "../appointments/entities/appointment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Client, Appointment])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
