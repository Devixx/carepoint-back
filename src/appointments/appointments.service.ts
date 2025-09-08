import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, FindOptionsWhere } from "typeorm";
import { Appointment, AppointmentStatus } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { User } from "../users/entities/user.entity";
import { Client } from "../clients/entities/client.entity";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, user: any) {
    const { doctorUserId, ...appointmentData } = createAppointmentDto;

    // Find doctor
    const doctor = await this.userRepository.findOne({
      where: { id: doctorUserId },
    });
    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    let patient: Client;

    if (user.type === "patient") {
      // Patient is booking for themselves
      const patientId = user.patientId || user.id;
      patient = await this.clientRepository.findOne({
        where: { id: patientId },
      });
      if (!patient) {
        throw new NotFoundException("Patient not found");
      }
    } else if (user.type === "doctor") {
      // Doctor/Admin is booking for a patient (need patientId in DTO)
      // For now, throw error - implement if needed
      throw new ForbiddenException(
        "Doctors cannot book appointments yet - implement patient selection",
      );
    }

    // Create appointment
    const appointment = this.appointmentRepository.create({
      ...appointmentData,
      doctor,
      patient,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(user: any) {
    if (user.type === "patient") {
      // For patients, only return their appointments
      const result = await this.listByPatient(
        user.patientId || user.id,
        { page: 1, limit: 50 },
        {},
      );
      return result.items;
    } else if (user.type === "doctor") {
      // For doctors, return their appointments (existing functionality)
      return this.appointmentRepository.find({
        where: { doctor: { id: user.userId || user.id } },
        relations: ["doctor", "patient"],
        order: { startTime: "ASC" },
      });
    }

    return [];
  }

  async findOne(id: string, user: any) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ["doctor", "patient"],
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    // Check if user has access to this appointment
    if (user.type === "patient") {
      const patientId = user.patientId || user.id;
      if (appointment.patient.id !== patientId) {
        throw new ForbiddenException("Access denied");
      }
    } else if (user.type === "doctor") {
      const doctorId = user.userId || user.id;
      if (appointment.doctor.id !== doctorId) {
        throw new ForbiddenException("Access denied");
      }
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: any,
  ) {
    const appointment = await this.findOne(id, user);
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string, user: any) {
    const appointment = await this.findOne(id, user);
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepository.save(appointment);
  }

  // Patient appointments listing
  async listByPatient(
    patientId: string,
    pagination: { page: number; limit: number },
    filter: {
      start?: string;
      end?: string;
      status?: AppointmentStatus | string;
    },
  ) {
    const where: FindOptionsWhere<Appointment> = {
      patient: { id: patientId } as Client,
    };

    // Date range filter
    if (filter.start || filter.end) {
      const start = filter.start
        ? new Date(`${filter.start}T00:00:00.000Z`)
        : undefined;
      const end = filter.end
        ? new Date(`${filter.end}T23:59:59.999Z`)
        : undefined;
      if (start && end) {
        (where as any).startTime = Between(start, end);
      }
    }

    // Status filter
    if (filter.status) {
      (where as any).status = filter.status as AppointmentStatus;
    }

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(Math.max(1, pagination.limit || 20), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await this.appointmentRepository.findAndCount({
      where,
      relations: ["doctor", "patient"],
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        type: true,
        title: true,
        description: true,
        notes: true,
        fee: true,
        doctor: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          specialty: true,
        },
        patient: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      order: { startTime: "ASC" },
      skip,
      take: limit,
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

  // Doctor availability
  async getAvailabilityForDoctor(doctorId: string, date: string) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const appointments = await this.appointmentRepository.find({
      where: {
        doctor: { id: doctorId } as any,
        startTime: Between(start, end),
        status: AppointmentStatus.CONFIRMED, // Only count confirmed appointments
      },
      select: ["startTime", "endTime"],
    });

    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    const slots: string[] = [];
    for (let h = 9; h < 17; h++) {
      for (const m of [0, 30]) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
      }
    }

    // Remove booked slots
    const busySlots = new Set(
      appointments.map((apt) => {
        const d = new Date(apt.startTime);
        return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
      }),
    );

    const availableSlots = slots.filter((slot) => !busySlots.has(slot));

    return {
      date,
      availableSlots,
    };
  }
}
