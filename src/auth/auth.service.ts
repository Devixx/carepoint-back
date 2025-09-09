import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../users/entities/user.entity";
import { Client } from "../clients/entities/client.entity";
import { PatientRegisterDto } from "./dto/patient-register.dto";
import { PatientLoginDto } from "./dto/patient-login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly jwtService: JwtService,
  ) {}

  // EXISTING DOCTOR AUTH METHODS (keep unchanged)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: "doctor",
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  // NEW PATIENT AUTH METHODS
  async registerPatient(patientRegisterDto: PatientRegisterDto) {
    const { email, password, ...patientData } = patientRegisterDto;

    // Check if patient already exists
    const existingPatient = await this.clientRepository.findOne({
      where: { email },
    });
    if (existingPatient) {
      throw new ConflictException("Patient with this email already exists");
    }

    // Check if email exists in doctor system
    const existingDoctor = await this.userRepository.findOne({
      where: { email },
    });
    if (existingDoctor) {
      throw new ConflictException("Email already exists in the system");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create patient
    const patient = this.clientRepository.create({
      ...patientData,
      email,
      password: hashedPassword,
    });

    const savedPatient = await this.clientRepository.save(patient);

    // Generate JWT token for patient
    const payload = {
      sub: savedPatient.id,
      email: savedPatient.email,
      type: "patient",
      patientId: savedPatient.id,
    };
    const token = this.jwtService.sign(payload);

    // Return patient data without password
    const { password: _, ...patientWithoutPassword } = savedPatient;

    return {
      token,
      user: patientWithoutPassword,
    };
  }

  async loginPatient(patientLoginDto: PatientLoginDto) {
    const { email, password } = patientLoginDto;

    // Find patient by email
    const patient = await this.clientRepository.findOne({ where: { email } });
    if (!patient) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if patient is active
    if (!patient.isActive) {
      throw new UnauthorizedException("Account is deactivated");
    }

    // Generate JWT token for patient
    const payload = {
      sub: patient.id,
      email: patient.email,
      type: "patient",
      patientId: patient.id,
    };
    const token = this.jwtService.sign(payload);

    // Return patient data without password
    const { password: _, ...patientWithoutPassword } = patient;

    return {
      token,
      user: patientWithoutPassword,
    };
  }

  // Validate patient token
  async validatePatient(patientId: string): Promise<Client> {
    console.log(
      "\n🔍 AuthService.validatePatient() called with ID:",
      patientId,
    );

    try {
      const patient = await this.clientRepository.findOne({
        where: { id: patientId },
        select: [
          "id",
          "email",
          "firstName",
          "lastName",
          "phone",
          "dateOfBirth",
          "address",
          "emergencyContact",
          "emergencyPhone",
          "isActive",
        ],
      });

      console.log(
        "🔍 Database query result:",
        patient ? "Patient found" : "Patient not found",
      );

      if (!patient) {
        console.error("❌ Patient not found in database:", patientId);
        throw new NotFoundException("Patient not found");
      }

      console.log("👤 Patient details:", {
        id: patient.id,
        email: patient.email,
        isActive: patient.isActive,
      });

      if (!patient.isActive) {
        console.error("❌ Patient account deactivated:", patientId);
        throw new UnauthorizedException("Account is deactivated");
      }

      console.log("✅ Patient validation successful");
      return patient;
    } catch (error) {
      console.error("❌ Error in validatePatient:", error);
      throw error;
    }
  }

  // Validate doctor token (for existing system)
  async validateDoctor(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "phone",
        "role",
        "specialty",
        "isActive",
      ],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is deactivated");
    }

    return user;
  }
}
