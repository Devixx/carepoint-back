import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Appointment } from "../../appointments/entities/appointment.entity";
import { Client } from "../../clients/entities/client.entity";

export enum UserRole {
  DOCTOR = "doctor",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.DOCTOR })
  role: UserRole;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: "json", nullable: true })
  workingHours: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => Client, (client) => client.doctor)
  patients: Client[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
