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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_entity_1 = require("./entities/client.entity");
let ClientsService = class ClientsService {
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    async create(createClientDto, doctor) {
        const existing = await this.clientsRepository.findOne({
            where: { email: createClientDto.email, doctor: { id: doctor.id } },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: "CP-409-PATIENT-EMAIL",
                message: "A patient with this email already exists for this doctor.",
                details: { email: createClientDto.email },
            });
        }
        const client = this.clientsRepository.create({
            ...createClientDto,
            doctor,
        });
        return this.clientsRepository.save(client);
    }
    async findAllByDoctor(doctorId) {
        return this.clientsRepository.find({
            where: { doctor: { id: doctorId } },
            relations: ["appointments"],
            order: { createdAt: "DESC" },
        });
    }
    async findOne(id) {
        const client = await this.clientsRepository.findOne({
            where: { id },
            relations: ["doctor", "appointments"],
        });
        if (!client) {
            throw new common_1.NotFoundException("Client not found");
        }
        return client;
    }
    async update(id, updateData) {
        await this.clientsRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.clientsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException("Client not found");
        }
    }
    // clients.service.ts
    async findAllByDoctorPaginated(doctorId, q) {
        const { page = 1, limit = 10, sort = "createdAt", order = "DESC", search, } = q;
        const skip = (page - 1) * limit;
        const qb = this.clientsRepository
            .createQueryBuilder("client")
            .where("client.doctorId = :doctorId", { doctorId });
        if (search) {
            qb.andWhere(`(` +
                `client.firstName ILIKE :s OR ` +
                `client.lastName ILIKE :s OR ` +
                `client.email ILIKE :s OR ` +
                `client.phone ILIKE :s` +
                `)`, { s: `%${search}%` });
        }
        // Basic allowlist for sort fields to avoid SQL injection via column name
        const sortable = new Set([
            "createdAt",
            "updatedAt",
            "firstName",
            "lastName",
            "email",
        ]);
        const sortField = sortable.has(sort) ? sort : "createdAt";
        const [items, total] = await qb
            .orderBy(`client.${sortField}`, order)
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return { items, meta: { total, page, limit } };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientsService);
//# sourceMappingURL=clients.service.js.map