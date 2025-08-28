"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const clients_module_1 = require("./clients/clients.module");
const appointments_module_1 = require("./appointments/appointments.module");
const user_entity_1 = require("./users/entities/user.entity");
const client_entity_1 = require("./clients/entities/client.entity");
const appointment_entity_1 = require("./appointments/entities/appointment.entity");
const fake_user_middleware_1 = require("./common/middleware/fake-user.middleware");
const request_logger_middleware_1 = require("./common/middleware/request-logger.middleware");
const system_controller_1 = require("./system/system.controller");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(fake_user_middleware_1.FakeUserMiddleware).forRoutes("*");
        consumer.apply(request_logger_middleware_1.RequestLoggerMiddleware).forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: "postgres",
                host: process.env.DATABASE_HOST || "localhost",
                port: parseInt(process.env.DATABASE_PORT) || 5432,
                username: process.env.DATABASE_USERNAME || "postgres",
                password: process.env.DATABASE_PASSWORD || "password",
                database: process.env.DATABASE_NAME || "carepoint_db",
                entities: [user_entity_1.User, client_entity_1.Client, appointment_entity_1.Appointment],
                synchronize: process.env.NODE_ENV === "development",
                logging: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            clients_module_1.ClientsModule,
            appointments_module_1.AppointmentsModule,
        ],
        controllers: [app_controller_1.AppController, system_controller_1.SystemController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map