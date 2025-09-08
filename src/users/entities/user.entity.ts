import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Appointment } from "../../appointments/entities/appointment.entity";

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

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
