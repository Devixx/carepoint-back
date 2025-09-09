import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // Doctor login endpoint - uses local auth guard for validation
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    console.log("🔐 Doctor login attempt:", req.user?.email);

    try {
      const result = await this.authService.login(req.user);
      console.log("✅ Doctor login successful:", req.user?.email);
      return result;
    } catch (error) {
      console.error("❌ Doctor login failed:", error);
      throw error;
    }
  }
}
