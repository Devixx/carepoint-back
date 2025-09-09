import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PatientRegisterDto } from "./dto/patient-register.dto";
import { PatientLoginDto } from "./dto/patient-login.dto";

@Controller("auth/patients")
export class PatientsAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) patientRegisterDto: PatientRegisterDto) {
    console.log("📝 Patient registration attempt:", patientRegisterDto.email);

    try {
      const result = await this.authService.registerPatient(patientRegisterDto);
      console.log("✅ Patient registration successful:", result.user.email);
      return result;
    } catch (error) {
      console.error("❌ Patient registration failed:", error);
      throw error;
    }
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) patientLoginDto: PatientLoginDto) {
    console.log("🔐 Patient login attempt:", patientLoginDto.email);

    try {
      const result = await this.authService.loginPatient(patientLoginDto);
      console.log("✅ Patient login successful:", result.user.email);
      return result;
    } catch (error) {
      console.error("❌ Patient login failed:", error);
      throw error;
    }
  }
}
