"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const users_service_1 = require("../../users/users.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(usersService) {
        const secret = process.env.JWT_SECRET || "carepoint-secret";
        console.log("🔍 JwtStrategy Constructor:");
        console.log("🔍 - Secret from env:", process.env.JWT_SECRET);
        console.log("🔍 - Final secret used:", secret);
        console.log("🔍 - Secret length:", secret.length);
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        this.usersService = usersService;
    }
    async validate(payload) {
        console.log("🔍 JWT Strategy validate called with payload:", payload);
        try {
            const user = await this.usersService.findById(payload.sub);
            console.log("✅ User found for validation:", user ? user.email : "NOT FOUND");
            return user;
        }
        catch (error) {
            console.log("❌ JWT validation error:", error.message);
            throw new common_1.UnauthorizedException("Invalid token");
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map