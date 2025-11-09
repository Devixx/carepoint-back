import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Appointment } from "../../appointments/entities/appointment.entity";
import { Client } from "../../clients/entities/client.entity";

export enum UserRole {
  ADMIN = "admin",
  DOCTOR = "doctor",
  NURSE = "nurse",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.DOCTOR,
  })
  role: UserRole;

  @Column({ nullable: true })
  specialty?: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column({ type: "text", nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  zipCode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Client, (client) => client.doctor)
  patients: Client[];

  @Column({ type: "json", nullable: true })
  workingHours: Record<string, any>;

  @Column({ type: "json", nullable: true })
  appointmentSettings: Record<string, any>;

  @Column({ type: "json", nullable: true })
  socialMedia?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };

  @Column({ type: "json", nullable: true })
  vacations?: Array<{
    startDate: string;
    endDate: string;
    reason?: string;
  }>;
}
