import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class DebugMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path.includes("/patients/")) {
      console.log("\n🌐 Request to patients endpoint:");
      console.log("📍 Path:", req.path);
      console.log(
        "🔑 Authorization header:",
        req.headers.authorization ? "Present" : "Missing",
      );
      console.log("📋 Headers:", {
        authorization: req.headers.authorization,
        "content-type": req.headers["content-type"],
      });
    }
    next();
  }
}
