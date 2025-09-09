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
    console.log("JWT Payload:", payload); // Debug log

    try {
      if (payload.type === "patient") {
        console.log("Validating patient:", payload.sub); // Debug log
        const patient = await this.authService.validatePatient(payload.sub);
        return {
          ...patient,
          type: "patient",
          patientId: patient.id,
        };
      } else {
        console.log("Validating doctor:", payload.sub); // Debug log
        const user = await this.authService.validateDoctor(payload.sub);
        return {
          ...user,
          type: "doctor",
          userId: user.id,
        };
      }
    } catch (error) {
      console.error("JWT validation error:", error); // Debug log
      throw new UnauthorizedException("Invalid token");
    }
  }
}
