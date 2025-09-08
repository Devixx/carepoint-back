import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Appointment } from "../../appointments/entities/appointment.entity";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: "date", nullable: true })
  dateOfBirth?: string;

  @Column({ type: "text", nullable: true })
  address?: string;

  @Column({ nullable: true })
  emergencyContact?: string;

  @Column({ nullable: true })
  emergencyPhone?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
