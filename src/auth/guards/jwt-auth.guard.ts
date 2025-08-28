import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log("🔍 JwtAuthGuard canActivate called");
    return true;
  }

  handleRequest(err: any, user: any, info: any) {
    console.log("🔍 JwtAuthGuard handleRequest:", { err, user: !!user, info });

    if (err || !user) {
      console.log("❌ Auth guard failed:", err?.message || "No user");
      throw err || new UnauthorizedException();
    }

    console.log("✅ Auth guard passed for user:", user.email);
    return user;
  }
}
