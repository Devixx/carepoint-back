import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    const secret = process.env.JWT_SECRET || "carepoint-secret";

    console.log("🔍 JwtStrategy Constructor:");
    console.log("🔍 - Secret from env:", process.env.JWT_SECRET);
    console.log("🔍 - Final secret used:", secret);
    console.log("🔍 - Secret length:", secret.length);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log("🔍 JWT Strategy validate called with payload:", payload);

    try {
      const user = await this.usersService.findById(payload.sub);
      console.log(
        "✅ User found for validation:",
        user ? user.email : "NOT FOUND",
      );
      return user;
    } catch (error) {
      console.log("❌ JWT validation error:", error.message);
      throw new UnauthorizedException("Invalid token");
    }
  }
}
