// src/system/system.controller.ts
import { Controller, Get } from "@nestjs/common";
import { DataSource } from "typeorm";

@Controller()
export class SystemController {
  constructor(private readonly ds: DataSource) {}

  @Get("ready")
  async ready() {
    try {
      await this.ds.query("SELECT 1");
      return { status: "ready" };
    } catch {
      return { status: "not_ready" };
    }
  }

  @Get("info")
  info() {
    return {
      name: "CarePoint Backend",
      version: process.env.APP_VERSION || "1.0.0",
      commit: process.env.GIT_COMMIT || "dev",
      env: process.env.NODE_ENV || "development",
    };
  }
}
