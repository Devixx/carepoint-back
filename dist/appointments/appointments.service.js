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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./entities/appointment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const clients_service_1 = require("../clients/clients.service");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
let AppointmentsService = class AppointmentsService {
    constructor(appointmentsRepository, clientsService, userRepo) {
        this.appointmentsRepository = appointmentsRepository;
        this.clientsService = clientsService;
        this.userRepo = userRepo;
    }
    async create(createAppointmentDto, doctor) {
        const patient = await this.clientsService.findOne(createAppointmentDto.patientId);
        // Check for conflicting appointments
        const conflictingAppointment = await this.appointmentsRepository.findOne({
            where: {
                doctor: { id: doctor.id },
                startTime: (0, typeorm_2.Between)(createAppointmentDto.startTime, createAppointmentDto.endTime),
            },
        });
        if (conflictingAppointment) {
            throw new common_1.BadRequestException("Time slot is already booked");
        }
        const appointment = this.appointmentsRepository.create({
            ...createAppointmentDto,
            doctor,
            patient,
        });
        return this.appointmentsRepository.save(appointment);
    }
    async findAllByDoctor(doctorId, query) {
        return this.findAndCountAppointments(query, doctorId);
    }
    async getCalendarData(date, doctorId) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.appointmentsRepository.find({
            where: {
                doctor: { id: doctorId },
                startTime: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
            relations: ["patient"],
            order: { startTime: "ASC" },
        });
    }
    async findOne(id) {
        const appointment = await this.appointmentsRepository.findOne({
            where: { id },
            relations: ["doctor", "patient"],
        });
        if (!appointment) {
            throw new common_1.NotFoundException("Appointment not found");
        }
        return appointment;
    }
    async update(id, updateData) {
        await this.appointmentsRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.appointmentsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException("Appointment not found");
        }
    }
    async findAndCountAppointments(q, doctorId) {
        const { page = 1, limit = 10, sort = "startTime", order = "ASC" } = q;
        const skip = (page - 1) * limit;
        const [items, total] = await this.appointmentsRepository.findAndCount({
            order: { startTime: "ASC" },
            skip,
            take: limit,
            where: { doctor: { id: doctorId } },
            relations: ["patient", "doctor"],
        });
        return { items, meta: { total, page, limit } };
    }
    async listByDoctor(doctorId, q, f) {
        const { page = 1, limit = 10, sort = "startTime", order = "ASC" } = q;
        const skip = (page - 1) * limit;
        const qb = this.appointmentsRepository
            .createQueryBuilder("appt")
            .leftJoin("appt.doctor", "doctor")
            .where("doctor.id = :doctorId", { doctorId });
        if (f?.start && f?.end) {
            const start = new Date(f.start);
            const end = new Date(f.end);
            qb.andWhere("appt.startTime BETWEEN :start AND :end", { start, end });
        }
        const sortable = new Set([
            "startTime",
            "endTime",
            "createdAt",
            "updatedAt",
            "title",
            "status",
        ]);
        const sortField = sortable.has(sort) ? sort : "startTime";
        const [items, total] = await qb
            .orderBy(`appt.${sortField}`, order)
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        console.log("Items:", items);
        console.log("Total:", total);
        return { items, meta: { total, page, limit } };
    }
    async dayByDoctor(doctorId, date) {
        const start = new Date(`${date}T00:00:00.000Z`);
        const end = new Date(`${date}T23:59:59.999Z`);
        return this.appointmentsRepository
            .createQueryBuilder("appt")
            .leftJoin("appt.doctor", "doctor")
            .where("doctor.id = :doctorId", { doctorId })
            .andWhere("appt.startTime BETWEEN :start AND :end", { start, end })
            .orderBy("appt.startTime", "ASC")
            .getMany();
    }
};
exports.AppointmentsService = AppointmentsService;
__decorate([
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AppointmentsService.prototype, "findAllByDoctor", null);
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        clients_service_1.ClientsService,
        typeorm_2.Repository])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map