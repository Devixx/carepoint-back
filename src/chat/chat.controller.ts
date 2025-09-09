import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";

interface ChatMessageDto {
  message: string;
}

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("message")
  async sendMessage(@Body() chatMessageDto: ChatMessageDto, @Request() req) {
    const patientId = req.user.patientId || req.user.id;

    console.log(
      "💬 Chat message from patient:",
      patientId,
      "Message:",
      chatMessageDto.message,
    );

    const response = await this.chatService.processMessage(
      chatMessageDto.message,
      patientId,
    );

    console.log("🤖 Bot response:", response);

    return response;
  }
}
