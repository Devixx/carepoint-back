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
exports.SystemController = void 0;
// src/system/system.controller.ts
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let SystemController = class SystemController {
    constructor(ds) {
        this.ds = ds;
    }
    async ready() {
        try {
            await this.ds.query("SELECT 1");
            return { status: "ready" };
        }
        catch {
            return { status: "not_ready" };
        }
    }
    info() {
        return {
            name: "CarePoint Backend",
            version: process.env.APP_VERSION || "1.0.0",
            commit: process.env.GIT_COMMIT || "dev",
            env: process.env.NODE_ENV || "development",
        };
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)("ready"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "ready", null);
__decorate([
    (0, common_1.Get)("info"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "info", null);
exports.SystemController = SystemController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SystemController);
//# sourceMappingURL=system.controller.js.map