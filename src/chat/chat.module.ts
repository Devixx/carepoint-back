import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { User } from "../users/entities/user.entity";
import { Client } from "../clients/entities/client.entity";
import { Appointment } from "../appointments/entities/appointment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Client, Appointment])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
