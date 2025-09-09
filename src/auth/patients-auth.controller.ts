import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Get,
  Headers,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PatientRegisterDto } from "./dto/patient-register.dto";
import { PatientLoginDto } from "./dto/patient-login.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Client } from "../clients/entities/client.entity";

@Controller("auth/patients")
export class PatientsAuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  // TEMPORARY DEBUG ENDPOINT - REMOVE IN PRODUCTION
  @Get("debug")
  async debug() {
    const clients = await this.clientRepository.find({
      select: ["id", "email", "firstName", "lastName", "isActive"],
      take: 5,
    });

    return {
      message: "Debug info",
      totalClients: clients.length,
      clients: clients.map((c) => ({
        id: c.id,
        email: c.email,
        name: `${c.firstName} ${c.lastName}`,
        isActive: c.isActive,
      })),
    };
  }

  @Get("debug-token")
  async debugToken(@Headers("authorization") authHeader: string) {
    console.log("🔧 Debug token endpoint called");
    console.log("📋 Auth header:", authHeader);

    if (!authHeader) {
      return { error: "No authorization header" };
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("🎫 Extracted token:", token.substring(0, 20) + "...");

    try {
      // Decode without verification for debugging
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );
      console.log("📋 Decoded payload:", payload);

      // Check if patient exists in database
      const patient = await this.clientRepository.findOne({
        where: { id: payload.sub },
        select: ["id", "email", "firstName", "lastName", "isActive"],
      });

      return {
        success: true,
        payload: payload,
        tokenPreview: token.substring(0, 20) + "...",
        patientExists: !!patient,
        patientDetails: patient
          ? {
              id: patient.id,
              email: patient.email,
              isActive: patient.isActive,
            }
          : null,
      };
    } catch (error) {
      console.error("❌ Token decode error:", error);
      return { error: error.message };
    }
  }

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
