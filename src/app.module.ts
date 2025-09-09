import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { ClientsModule } from "./clients/clients.module";
import { AppointmentsModule } from "./appointments/appointments.module";
import { AuthModule } from "./auth/auth.module";
import { User } from "./users/entities/user.entity";
import { Client } from "./clients/entities/client.entity";
import { Appointment } from "./appointments/entities/appointment.entity";
import { SystemController } from "./system/system.controller";
import { SeedModule } from "./database/seed.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USERNAME || "postgres",
      password: process.env.DATABASE_PASSWORD || "password",
      database: process.env.DATABASE_NAME || "carepoint_db",
      entities: [User, Client, Appointment],
      synchronize: true,
      dropSchema: true,
      logging: true,
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    AppointmentsModule,
    SeedModule,
  ],
  controllers: [AppController, SystemController],
  providers: [AppService],
})
export class AppModule {}
