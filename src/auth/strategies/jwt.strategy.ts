import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "your-secret-key",
    });
  }

  async validate(payload: any) {
    try {
      // Check if it's a patient or doctor token
      if (payload.type === "patient") {
        const patient = await this.authService.validatePatient(payload.sub);
        return {
          ...patient,
          type: "patient",
          patientId: patient.id,
        };
      } else {
        // Doctor/Admin validation (existing system)
        const user = await this.authService.validateDoctor(payload.sub);
        return {
          ...user,
          type: "doctor",
          userId: user.id,
        };
      }
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
