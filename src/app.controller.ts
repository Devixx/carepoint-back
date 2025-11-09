import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { nowISO } from "./utils/date.utils";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  getHealth(): object {
    return {
      status: "ok",
      message: "CarePoint Backend is running!",
      timestamp: nowISO(),
    };
  }
}
