// src/common/middleware/request-logger.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const start = Date.now();
    const cid = req.headers["x-request-id"] || randomUUID();
    req.cid = cid;
    res.setHeader("x-request-id", cid);

    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `[${cid}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      );
    });
    next();
  }
}
