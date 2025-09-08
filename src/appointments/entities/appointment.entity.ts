import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Client } from "../../clients/entities/client.entity";

export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  NO_SHOW = "no_show",
  IN_PROGRESS = "in_progress",
}

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  fee?: number;

  @ManyToOne(() => User, (user) => user.doctorAppointments, { eager: false })
  doctor: User;

  @ManyToOne(() => Client, (client) => client.appointments, { eager: false })
  patient: Client;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
