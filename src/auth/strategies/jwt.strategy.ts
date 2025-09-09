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
      secretOrKey:
        process.env.JWT_SECRET || "a-string-secret-at-least-256-bits-long",
    });

    console.log(
      "🔧 JWT Strategy initialized with secret:",
      process.env.JWT_SECRET || "a-string-secret-at-least-256-bits-long",
    );
  }

  async validate(payload: any) {
    console.log("\n🔍 JWT Strategy validate() called");
    console.log("📋 Full payload received:", JSON.stringify(payload, null, 2));

    // Check token expiration manually
    const now = Math.floor(Date.now() / 1000);
    console.log("⏰ Token expiry check:", {
      now: now,
      exp: payload.exp,
      expired: payload.exp < now,
    });

    if (payload.exp < now) {
      console.error("❌ Token expired");
      throw new UnauthorizedException("Token expired");
    }

    try {
      if (payload.type === "patient") {
        console.log("👤 Processing patient token for ID:", payload.sub);

        // Check if AuthService is available
        if (!this.authService) {
          console.error("❌ AuthService not available");
          throw new UnauthorizedException("AuthService not available");
        }

        console.log("🔍 Calling authService.validatePatient...");
        const patient = await this.authService.validatePatient(payload.sub);
        console.log("✅ Patient found:", patient.email);

        const user = {
          ...patient,
          type: "patient",
          patientId: patient.id,
        };

        console.log("✅ Returning user object:", {
          id: user.id,
          email: user.email,
          type: user.type,
          patientId: user.patientId,
        });

        return user;
      } else {
        console.log("👨‍⚕️ Processing doctor token for ID:", payload.sub);

        const user = await this.authService.validateDoctor(payload.sub);

        const result = {
          ...user,
          type: "doctor",
          userId: user.id,
        };

        console.log("✅ Doctor validation successful:", result.email);
        return result;
      }
    } catch (error) {
      console.error("❌ JWT validation error details:", {
        message: error.message,
        stack: error.stack,
        name: error.constructor.name,
      });
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }
}
