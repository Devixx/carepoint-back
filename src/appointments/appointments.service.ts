import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Query,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, FindOptionsWhere } from "typeorm";
import { Appointment, AppointmentStatus } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { User } from "../users/entities/user.entity";
import { Client } from "../clients/entities/client.entity";
import { PaginationQueryDto } from "../auth/dto/pagination-query.dto";
import { AppointmentsFilterDto } from "./dto/appointments-filter.dto";
import {
  parseDate,
  parseAndValidateDate,
  getStartOfDay,
  getEndOfDay,
  getDayRange,
  createDateRange,
  addMinutes,
  toISOString,
  getTimeString,
  isValidDate,
} from "../utils/date.utils";

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

  // Helper method to remove sensitive data from appointment(s)
  private sanitizeAppointment(appointment: Appointment): Appointment {
    if (appointment?.doctor) {
      delete (appointment.doctor as any).password;
    }
    if (appointment?.patient) {
      delete (appointment.patient as any).password;
    }
    return appointment;
  }

  private sanitizeAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.map(apt => this.sanitizeAppointment(apt));
  }

  async create(createAppointmentDto: CreateAppointmentDto, user: any) {
    const { doctorUserId, patientId, ...appointmentData } =
      createAppointmentDto;

    const resolvedDoctorId =
      doctorUserId ?? user?.userId ?? user?.id ?? user?.doctorId;

    const doctor = await this.userRepository.findOne({
      where: { id: resolvedDoctorId },
    });
    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    let patient: Client | null = null;

    if (user.type === "patient") {
      const selfPatientId = user.patientId || user.id;
      patient = await this.clientRepository.findOne({
        where: { id: selfPatientId },
      });
      if (!patient) {
        throw new NotFoundException("Patient not found");
      }
    } else if (patientId) {
      patient = await this.clientRepository.findOne({
        where: { id: patientId },
      });
      if (!patient) {
        throw new NotFoundException("Patient not found");
      }
    } else {
      throw new NotFoundException("Patient not found");
    }

    // Parse and validate dates using centralized utilities
    const startTime = parseDate(appointmentData.startTime);
    const endTime = parseDate(appointmentData.endTime);

    if (appointmentData.startTime && !startTime) {
      throw new Error(`Invalid startTime: ${appointmentData.startTime}`);
    }
    if (appointmentData.endTime && !endTime) {
      throw new Error(`Invalid endTime: ${appointmentData.endTime}`);
    }

    // Debug logging - always log for troubleshooting
    console.log("=== APPOINTMENT CREATION DEBUG ===");
    console.log("Received payload:", {
      startTimeInput: appointmentData.startTime,
      endTimeInput: appointmentData.endTime,
    });
    console.log("Parsed dates:", {
      startTime: startTime ? {
        iso: toISOString(startTime),
        utc: startTime.toUTCString(),
        timestamp: startTime.getTime(),
        local: startTime.toLocaleString('en-US', { timeZone: 'Europe/Luxembourg' }),
      } : null,
      endTime: endTime ? {
        iso: toISOString(endTime),
        utc: endTime.toUTCString(),
        timestamp: endTime.getTime(),
        local: endTime.toLocaleString('en-US', { timeZone: 'Europe/Luxembourg' }),
      } : null,
    });
    console.log("===================================");

    const appointment = this.appointmentRepository.create({
      ...appointmentData,
      startTime: startTime,
      endTime: endTime,
      doctor,
      patient,
      status: AppointmentStatus.PENDING,
    });

    const saved = await this.appointmentRepository.save(appointment);

    const result = await this.appointmentRepository.findOne({
      where: { id: saved.id },
      relations: ["doctor", "patient"],
    });

    return this.sanitizeAppointment(result);
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
      const appointments = await this.appointmentRepository.find({
        where: { doctor: { id: user.userId || user.id } },
        relations: ["doctor", "patient"],
        order: { startTime: "ASC" },
      });
      return this.sanitizeAppointments(appointments);
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

    return this.sanitizeAppointment(appointment);
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: any,
  ) {
    const appointment = await this.findOne(id, user);
    
    // Explicitly parse ISO date strings as UTC if provided
    if (updateAppointmentDto.startTime) {
      appointment.startTime = parseAndValidateDate(
        updateAppointmentDto.startTime,
        "startTime",
      );
    }

    if (updateAppointmentDto.endTime) {
      appointment.endTime = parseAndValidateDate(
        updateAppointmentDto.endTime,
        "endTime",
      );
    }
    
    // Update other fields
    if (updateAppointmentDto.title !== undefined) {
      appointment.title = updateAppointmentDto.title;
    }
    if (updateAppointmentDto.description !== undefined) {
      appointment.description = updateAppointmentDto.description;
    }
    if (updateAppointmentDto.notes !== undefined) {
      appointment.notes = updateAppointmentDto.notes;
    }
    if (updateAppointmentDto.type !== undefined) {
      appointment.type = updateAppointmentDto.type;
    }
    if (updateAppointmentDto.status !== undefined) {
      appointment.status = updateAppointmentDto.status as AppointmentStatus;
    }
    if (updateAppointmentDto.fee !== undefined) {
      appointment.fee = updateAppointmentDto.fee;
    }
    
    const updated = await this.appointmentRepository.save(appointment);
    
    return this.sanitizeAppointment(updated);
  }

  async remove(id: string, user: any) {
    const appointment = await this.findOne(id, user);
    appointment.status = AppointmentStatus.CANCELLED;
    const updated = await this.appointmentRepository.save(appointment);
    return this.sanitizeAppointment(updated);
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
    const dateRange = createDateRange(filter.start, filter.end);
    if (dateRange) {
      (where as any).startTime = Between(dateRange.start, dateRange.end);
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
      items: this.sanitizeAppointments(items),
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
    // Step 1: Get doctor's schedule for the date
    const { start, end } = getDayRange(date);
    const now = new Date();

    console.log("=== GET AVAILABILITY DEBUG ===");
    console.log("Doctor ID:", doctorId);
    console.log("Requested date:", date);
    console.log("Date range:", { start: start.toISOString(), end: end.toISOString() });
    console.log("Current time:", {
      iso: now.toISOString(),
      local: now.toLocaleString('en-US', { timeZone: 'Europe/Luxembourg' }),
      hour: now.getHours(),
      minute: now.getMinutes(),
    });

    // Step 1.5: Check if doctor is on vacation
    const doctor = await this.userRepository.findOne({
      where: { id: doctorId },
      select: ['id', 'firstName', 'lastName', 'vacations'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if the requested date falls within any vacation period
    const checkDate = parseDate(date);
    const isOnVacation = doctor.vacations?.some((vacation) => {
      const vacationStart = parseDate(vacation.startDate);
      const vacationEnd = parseDate(vacation.endDate);
      
      if (!vacationStart || !vacationEnd || !checkDate) {
        return false;
      }

      // Set all times to midnight for date-only comparison
      vacationStart.setHours(0, 0, 0, 0);
      vacationEnd.setHours(23, 59, 59, 999);
      checkDate.setHours(0, 0, 0, 0);

      return checkDate >= vacationStart && checkDate <= vacationEnd;
    });

    console.log("Doctor vacation check:", {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      vacations: doctor.vacations,
      isOnVacation,
    });

    // If doctor is on vacation, return empty availability
    if (isOnVacation) {
      const vacationInfo = doctor.vacations?.find((vacation) => {
        const vacationStart = parseDate(vacation.startDate);
        const vacationEnd = parseDate(vacation.endDate);
        const vacationCheckDate = parseDate(date);
        
        if (!vacationStart || !vacationEnd || !vacationCheckDate) {
          return false;
        }

        vacationStart.setHours(0, 0, 0, 0);
        vacationEnd.setHours(23, 59, 59, 999);
        vacationCheckDate.setHours(0, 0, 0, 0);

        return vacationCheckDate >= vacationStart && vacationCheckDate <= vacationEnd;
      });

      console.log("Doctor is on vacation, returning no availability");
      console.log("===============================");

      return {
        date,
        availableSlots: [],
        totalSlots: 0,
        bookedSlots: 0,
        availableCount: 0,
        currentTime: now.toISOString(),
        onVacation: true,
        vacationReason: vacationInfo?.reason || 'Vacation',
      };
    }

    // Step 3: Query appointments table
    // Get all appointments for this doctor on this date (excluding cancelled)
    const appointments = await this.appointmentRepository
      .createQueryBuilder("appointment")
      .select(["appointment.startTime", "appointment.endTime", "appointment.status"])
      .where("appointment.doctorId = :doctorId", { doctorId })
      .andWhere("appointment.startTime BETWEEN :start AND :end", { start, end })
      .andWhere("appointment.status != :cancelledStatus", { 
        cancelledStatus: AppointmentStatus.CANCELLED 
      })
      .getMany();

    console.log(`Found ${appointments.length} appointments (excluding cancelled)`);

    // Step 2: Generate all time slots (9 AM to 5 PM, 30-minute intervals)
    const slots: string[] = [];
    for (let h = 9; h < 17; h++) {
      for (const m of [0, 30]) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
      }
    }

    console.log(`Generated ${slots.length} total time slots`);

    // Step 4: Filter out the booked slots from available slots
    // Debug: Show what time format we're getting from appointments
    if (appointments.length > 0) {
      console.log("Appointment times (raw):", appointments.map(apt => ({
        startTime: apt.startTime,
        startTimeISO: apt.startTime.toISOString(),
        timeStringUTC: getTimeString(apt.startTime, true),
        timeStringLocal: getTimeString(apt.startTime, false),
        status: apt.status,
      })));
    }

    const busySlots = new Set(
      appointments.map((apt) => getTimeString(apt.startTime, false)), // Use local time, not UTC
    );

    console.log("Booked slots:", Array.from(busySlots));
    console.log("Generated slots (first 5):", slots.slice(0, 5));
    
    if (appointments.length > 0) {
      console.log("Status breakdown:", {
        pending: appointments.filter(a => a.status === AppointmentStatus.PENDING).length,
        confirmed: appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length,
        inProgress: appointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS).length,
        completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
        noShow: appointments.filter(a => a.status === AppointmentStatus.NO_SHOW).length,
      });
    }

    let availableSlots = slots.filter((slot) => !busySlots.has(slot));
    console.log(`Available slots before time filter: ${availableSlots.length}`);
    console.log(`Filtering logic test - is "09:00" in busySlots?`, busySlots.has("09:00"));
    console.log(`Filtering logic test - is "16:00" in busySlots?`, busySlots.has("16:00"));

    // Additional filter: Remove past time slots if the date is today
    const requestedDate = parseDate(date);
    if (requestedDate) {
      const isToday = 
        requestedDate.getFullYear() === now.getFullYear() &&
        requestedDate.getMonth() === now.getMonth() &&
        requestedDate.getDate() === now.getDate();

      console.log("Is today?", isToday);

      if (isToday) {
        // Get current time in HH:MM format
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        console.log(`Filtering slots after ${currentHour}:${currentMinute}`);
        
        availableSlots = availableSlots.filter((slot) => {
          const [slotHour, slotMinute] = slot.split(':').map(Number);
          
          // Only show slots that are in the future
          if (slotHour > currentHour) {
            return true;
          } else if (slotHour === currentHour) {
            return slotMinute > currentMinute;
          }
          return false;
        });
        
        console.log(`Available slots after time filter: ${availableSlots.length}`);
      }
    }

    // Step 5: Return only unbooked slots
    console.log("Final available slots:", availableSlots);
    console.log("===============================");

    return {
      date,
      availableSlots,
      totalSlots: slots.length,
      bookedSlots: busySlots.size,
      availableCount: availableSlots.length,
      currentTime: now.toISOString(),
      onVacation: false,
    };
  }

  async getCalendarData(
    date: string,
    doctorId: string,
  ): Promise<Appointment[]> {
    const { start: startOfDay, end: endOfDay } = getDayRange(date);

    console.log("=== GET CALENDAR DATA DEBUG ===");
    console.log("Input date:", date);
    console.log("Doctor ID:", doctorId);
    console.log("Date range:", {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString(),
      startLocal: startOfDay.toLocaleString('en-US', { timeZone: 'Europe/Luxembourg' }),
      endLocal: endOfDay.toLocaleString('en-US', { timeZone: 'Europe/Luxembourg' }),
    });

    const appointments = await this.appointmentRepository.find({
      where: {
        doctor: { id: doctorId },
        startTime: Between(startOfDay, endOfDay),
      },
      relations: ["patient"],
      order: { startTime: "ASC" },
    });
    
    console.log(`Found ${appointments.length} appointments`);
    if (appointments.length > 0) {
      console.log("Appointments:", appointments.map(a => ({
        id: a.id,
        startTime: a.startTime,
        doctorId: a.doctor?.id
      })));
    }
    console.log("================================");
    
    return this.sanitizeAppointments(appointments);
  }

  async findAndCountAppointments(q: PaginationQueryDto, doctorId: string) {
    const { page = 1, limit = 10, sort = "startTime", order = "ASC" } = q;
    const skip = (page - 1) * limit;
    const [items, total] = await this.appointmentRepository.findAndCount({
      order: { startTime: "ASC" },
      skip,
      take: limit,
      where: { doctor: { id: doctorId } },
      relations: ["patient", "doctor"],
    });
    return { items: this.sanitizeAppointments(items), meta: { total, page, limit } };
  }

  async listByDoctor(
    doctorId: string,
    q: PaginationQueryDto,
    f: AppointmentsFilterDto,
  ) {
    const { page = 1, limit = 10, sort = "startTime", order = "ASC" } = q;
    const skip = (page - 1) * limit;

    const qb = this.appointmentRepository
      .createQueryBuilder("appt")
      .leftJoin("appt.doctor", "doctor")
      .leftJoinAndSelect("appt.patient", "patient")
      .where("doctor.id = :doctorId", { doctorId });

    if (f?.start && f?.end) {
      const dateRange = createDateRange(f.start, f.end);
      if (dateRange) {
        qb.andWhere("appt.startTime BETWEEN :start AND :end", {
          start: dateRange.start,
          end: dateRange.end,
        });
      }
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

    return { items: this.sanitizeAppointments(items), meta: { total, page, limit } };
  }

  async dayByDoctor(doctorId: string, date: string) {
    const { start, end } = getDayRange(date);

    const appointments = await this.appointmentRepository
      .createQueryBuilder("appt")
      .leftJoin("appt.doctor", "doctor")
      .leftJoinAndSelect("appt.patient", "patient")
      .where("doctor.id = :doctorId", { doctorId })
      .andWhere("appt.startTime BETWEEN :start AND :end", { start, end })
      .orderBy("appt.startTime", "ASC")
      .getMany();
      
    return this.sanitizeAppointments(appointments);
  }

  async findAllByDoctor(doctorId: string, @Query() query: PaginationQueryDto) {
    return this.findAndCountAppointments(query, doctorId);
  }
}
