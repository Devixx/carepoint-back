import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "carepoint-secret",
      signOptions: { expiresIn: "7d" },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {
  constructor() {
    console.log("🔍 AuthModule Constructor:");
    console.log("🔍 - Secret from env:", process.env.JWT_SECRET);
    console.log(
      "🔍 - Final secret used:",
      process.env.JWT_SECRET || "carepoint-secret",
    );
    console.log(
      "🔍 - Secret length:",
      (process.env.JWT_SECRET || "carepoint-secret").length,
    );
  }
}
