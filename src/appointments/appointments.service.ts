import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Appointment } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { User } from "../users/entities/user.entity";
import { ClientsService } from "../clients/clients.service";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { AppointmentsFilterDto } from "./dto/appointments-filter.dto";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    private readonly clientsService: ClientsService, // must come from ClientsModule exports
    @InjectRepository(User) // if you need doctor/user repository
    private readonly userRepo: Repository<User>, // <-- this is index
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    doctor: User,
  ): Promise<Appointment> {
    const patient = await this.clientsService.findOne(
      createAppointmentDto.patientId,
    );

    // Check for conflicting appointments
    const conflictingAppointment = await this.appointmentsRepository.findOne({
      where: {
        doctor: { id: doctor.id },
        startTime: Between(
          createAppointmentDto.startTime,
          createAppointmentDto.endTime,
        ),
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException("Time slot is already booked");
    }

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      doctor,
      patient,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async findAllByDoctor(doctorId: string, @Query() query: PaginationQueryDto) {
    return this.findAndCountAppointments(query, doctorId);
  }

  async getCalendarData(
    date: string,
    doctorId: string,
  ): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.appointmentsRepository.find({
      where: {
        doctor: { id: doctorId },
        startTime: Between(startOfDay, endOfDay),
      },
      relations: ["patient"],
      order: { startTime: "ASC" },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ["doctor", "patient"],
    });
    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }
    return appointment;
  }

  async update(
    id: string,
    updateData: Partial<CreateAppointmentDto>,
  ): Promise<Appointment> {
    await this.appointmentsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException("Appointment not found");
    }
  }
  async findAndCountAppointments(q: PaginationQueryDto, doctorId: string) {
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

  async listByDoctor(
    doctorId: string,
    q: PaginationQueryDto,
    f: AppointmentsFilterDto,
  ) {
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
      .orderBy(`appt.${sortField}`, order as "ASC" | "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    console.log("Items:", items);
    console.log("Total:", total);

    return { items, meta: { total, page, limit } };
  }

  async dayByDoctor(doctorId: string, date: string) {
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
}
