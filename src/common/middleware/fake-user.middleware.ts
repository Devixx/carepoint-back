// src/auth/middleware/fake-user.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class FakeUserMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    if (process.env.AUTH_BYPASS === "true" && !req.user) {
      req.user = {
        id: process.env.DEV_DOCTOR_ID || "00000000-0000-0000-0000-000000000000",
        email: "dev@carepoint.lu",
        role: "doctor",
      };
    }
    next();
  }
}
