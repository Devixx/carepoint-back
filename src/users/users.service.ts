import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
import { RegisterDto } from "../auth/dto/register.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: RegisterDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "role",
        "specialty",
        "isActive",
        "createdAt",
      ],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException("User not found");
    }
  }

  async findByRoleAndFilters(
    role: UserRole,
    filters: { specialty?: string; search?: string },
  ) {
    const where: any = { role };
    if (filters.specialty) where.specialty = filters.specialty;
    if (filters.search) {
      where.firstName = ILike(`%${filters.search}%`);
      // or build proper OR: firstName / lastName / specialty
    }

    return this.usersRepository.find({
      where,
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "phone",
        "specialty",
        "isActive",
        "workingHours",
        "createdAt",
        "updatedAt",
      ],
      order: { lastName: "ASC", firstName: "ASC" },
    });
  }

  async findOneDoctorPublic(id: string) {
    return this.usersRepository.findOne({
      where: { id, role: UserRole.DOCTOR },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "phone",
        "specialty",
        "workingHours",
        "isActive",
      ],
    });
  }
}
