import { Module, MiddlewareConsumer } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { ClientsModule } from "./clients/clients.module";
import { AppointmentsModule } from "./appointments/appointments.module";
import { AuthModule } from "./auth/auth.module";
import { SeedModule } from "./database/seed.module";
import { ChatModule } from "./chat/chat.module";
import { User } from "./users/entities/user.entity";
import { Client } from "./clients/entities/client.entity";
import { Appointment } from "./appointments/entities/appointment.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || process.env.DATABASE_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || "password",
      database: process.env.DB_NAME || process.env.DATABASE_NAME || "carepoint_db",
      entities: [User, Client, Appointment],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    AppointmentsModule,
    SeedModule,
    ChatModule, // Add this
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
