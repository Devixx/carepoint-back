"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeUserMiddleware = void 0;
// src/auth/middleware/fake-user.middleware.ts
const common_1 = require("@nestjs/common");
let FakeUserMiddleware = class FakeUserMiddleware {
    use(req, _res, next) {
        if (process.env.AUTH_BYPASS === "true" && !req.user) {
            req.user = {
                id: process.env.DEV_DOCTOR_ID || "00000000-0000-0000-0000-000000000000",
                email: "dev@carepoint.lu",
                role: "doctor",
            };
        }
        next();
    }
};
exports.FakeUserMiddleware = FakeUserMiddleware;
exports.FakeUserMiddleware = FakeUserMiddleware = __decorate([
    (0, common_1.Injectable)()
], FakeUserMiddleware);
//# sourceMappingURL=fake-user.middleware.js.map