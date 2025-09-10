import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Client } from "./entities/client.entity";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  create(createClientDto: CreateClientDto) {
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  findAll() {
    return this.clientRepository.find({
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "isActive",
        "createdAt",
      ],
    });
  }

  async findOne(id: string) {
    const client = await this.clientRepository.findOne({
      where: { id },
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "dateOfBirth",
        "address",
        "emergencyContact",
        "emergencyPhone",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!client) {
      throw new NotFoundException("Client not found");
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const client = await this.findOne(id);
    Object.assign(client, updateProfileDto);
    return this.clientRepository.save(client);
  }

  async remove(id: string) {
    const client = await this.findOne(id);
    return this.clientRepository.remove(client);
  }

  // Add this method if it's being used somewhere
  async findAllByDoctorPaginated(
    doctorId: string,
    query: { page?: number; limit?: number },
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(Math.max(1, query.limit || 20), 100);
    const skip = (page - 1) * limit;

    // This would be for a specific use case where clients are associated with doctors
    // For now, just return all clients with pagination
    const [items, total] = await this.clientRepository.findAndCount({
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "isActive",
        "createdAt",
      ],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllByDoctor(doctorId: string): Promise<Client[]> {
    return this.clientRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ["appointments"],
      order: { createdAt: "DESC" },
    });
  }
}
