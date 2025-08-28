import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Client } from "./entities/client.entity";
import { CreateClientDto } from "./dto/create-client.dto";
import { User } from "../users/entities/user.entity";
import { PaginationQueryDto } from "../auth/dto/pagination-query.dto";

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(
    createClientDto: CreateClientDto,
    doctor: User,
  ): Promise<Client> {
    const existing = await this.clientsRepository.findOne({
      where: { email: createClientDto.email, doctor: { id: doctor.id } },
    });
    if (existing) {
      throw new ConflictException({
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

  async findAllByDoctor(doctorId: string): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ["appointments"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id },
      relations: ["doctor", "appointments"],
    });
    if (!client) {
      throw new NotFoundException("Client not found");
    }
    return client;
  }

  async update(
    id: string,
    updateData: Partial<CreateClientDto>,
  ): Promise<Client> {
    await this.clientsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException("Client not found");
    }
  }

  // clients.service.ts
  async findAllByDoctorPaginated(doctorId: string, q: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
      search,
    } = q;
    const skip = (page - 1) * limit;

    const qb = this.clientsRepository
      .createQueryBuilder("client")
      .where("client.doctorId = :doctorId", { doctorId });

    if (search) {
      qb.andWhere(
        `(` +
          `client.firstName ILIKE :s OR ` +
          `client.lastName ILIKE :s OR ` +
          `client.email ILIKE :s OR ` +
          `client.phone ILIKE :s` +
          `)`,
        { s: `%${search}%` },
      );
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
      .orderBy(`client.${sortField}`, order as "ASC" | "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, meta: { total, page, limit } };
  }
}
