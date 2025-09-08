import { Controller, Post, Body, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PatientRegisterDto } from "./dto/patient-register.dto";
import { PatientLoginDto } from "./dto/patient-login.dto";

@Controller("auth/patients")
export class PatientsAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body(ValidationPipe) patientRegisterDto: PatientRegisterDto) {
    return this.authService.registerPatient(patientRegisterDto);
  }

  @Post("login")
  async login(@Body(ValidationPipe) patientLoginDto: PatientLoginDto) {
    return this.authService.loginPatient(patientLoginDto);
  }
}
