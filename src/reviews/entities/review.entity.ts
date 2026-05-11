import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Client } from "../../clients/entities/client.entity";
import { Appointment } from "../../appointments/entities/appointment.entity";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int" })
  rating: number; // 1-5

  @Column({ type: "text", nullable: true })
  comment?: string;

  @Column({ nullable: true })
  doctorId: string;

  @ManyToOne(() => User, { eager: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "doctorId" })
  doctor: User;

  @Column({ nullable: true })
  patientId: string;

  @ManyToOne(() => Client, { eager: false, onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "patientId" })
  patient: Client;

  @Column({ nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment, { eager: false, onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "appointmentId" })
  appointment: Appointment;

  @Column({ default: false })
  isHidden: boolean;

  @Column({ nullable: true })
  reportReason?: string;

  @Column({ type: "timestamptz", nullable: true })
  reportedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
