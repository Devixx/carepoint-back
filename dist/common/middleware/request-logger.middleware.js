"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggerMiddleware = void 0;
// src/common/middleware/request-logger.middleware.ts
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let RequestLoggerMiddleware = class RequestLoggerMiddleware {
    use(req, res, next) {
        const start = Date.now();
        const cid = req.headers["x-request-id"] || (0, crypto_1.randomUUID)();
        req.cid = cid;
        res.setHeader("x-request-id", cid);
        res.on("finish", () => {
            const duration = Date.now() - start;
            console.log(`[${cid}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
        });
        next();
    }
};
exports.RequestLoggerMiddleware = RequestLoggerMiddleware;
exports.RequestLoggerMiddleware = RequestLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestLoggerMiddleware);
//# sourceMappingURL=request-logger.middleware.js.map