import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "../users/entities/user.entity";
import { Client } from "../clients/entities/client.entity";
import {
  Appointment,
  AppointmentStatus,
} from "../appointments/entities/appointment.entity";
import { now, addDays, addMinutes } from "../utils/date.utils";

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async seed() {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await this.clearDatabase();

    // Create doctors and patients
    const doctors = await this.createDoctors();
    const patients = await this.createPatients();

    // Create appointments
    await this.createAppointments(doctors, patients);

    console.log("✅ Database seeding completed successfully!");
  }

  private async clearDatabase() {
    console.log("🧹 Clearing existing data...");

    try {
      // Method 1: Use clear() method (recommended)
      await this.appointmentRepository.clear();
      await this.clientRepository.clear();
      await this.userRepository.clear();

      console.log("✅ Database cleared using clear() method");
    } catch (error) {
      console.log("⚠️ clear() failed, trying alternative method...");

      try {
        // Method 2: Use query builder
        await this.appointmentRepository
          .createQueryBuilder()
          .delete()
          .execute();
        await this.clientRepository.createQueryBuilder().delete().execute();
        await this.userRepository.createQueryBuilder().delete().execute();

        console.log("✅ Database cleared using query builder");
      } catch (error2) {
        console.log("⚠️ Query builder failed, trying raw SQL...");

        try {
          // Method 3: Use raw SQL as last resort
          await this.appointmentRepository.query(
            "TRUNCATE TABLE appointments CASCADE",
          );
          await this.clientRepository.query("TRUNCATE TABLE clients CASCADE");
          await this.userRepository.query("TRUNCATE TABLE users CASCADE");

          console.log("✅ Database cleared using raw SQL");
        } catch (error3) {
          console.error("❌ All clearing methods failed:", error3);
          throw error3;
        }
      }
    }
  }

  private async createDoctors() {
    console.log("👩‍⚕️ Creating doctors...");
    const saltRounds = 10;
    const password = await bcrypt.hash("password123", saltRounds);

    // Get current date for relative vacation dates
    const currentDate = now();
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const doctorsData = [
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "dr.sarah@carepoint.lu",
        phone: "+352 621 001 001",
        specialty: "Cardiology",
        role: UserRole.DOCTOR,
        socialMedia: {
          facebook: "https://www.facebook.com/WHO",
          twitter: "https://twitter.com/WHO",
          linkedin: "https://www.linkedin.com/company/world-health-organization",
          instagram: "https://www.instagram.com/who",
        },
        vacations: [
          {
            startDate: formatDate(addDays(currentDate, 7)),
            endDate: formatDate(addDays(currentDate, 14)),
            reason: "Annual Leave - Summer Vacation",
          },
          {
            startDate: formatDate(addDays(currentDate, 60)),
            endDate: formatDate(addDays(currentDate, 67)),
            reason: "Medical Conference in Geneva",
          },
        ],
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        email: "dr.michael@carepoint.lu",
        phone: "+352 621 001 002",
        specialty: "Internal Medicine",
        role: UserRole.DOCTOR,
        socialMedia: {
          facebook: "https://www.facebook.com/CDC",
          twitter: "https://twitter.com/CDCgov",
          linkedin: "https://www.linkedin.com/company/centers-for-disease-control-and-prevention",
          instagram: "https://www.instagram.com/cdcgov",
        },
        vacations: [
          {
            startDate: formatDate(addDays(currentDate, 21)),
            endDate: formatDate(addDays(currentDate, 25)),
            reason: "Family Holiday",
          },
        ],
      },
      {
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "dr.emily@carepoint.lu",
        phone: "+352 621 001 003",
        specialty: "Dermatology",
        role: UserRole.DOCTOR,
        socialMedia: {
          facebook: "https://www.facebook.com/drpimplepopper",
          twitter: "https://twitter.com/drpimplepopper",
          instagram: "https://www.instagram.com/drpimplepopper",
          linkedin: "https://www.linkedin.com/in/sandra-lee-dermatology",
        },
        vacations: [
          {
            startDate: formatDate(addDays(currentDate, 30)),
            endDate: formatDate(addDays(currentDate, 44)),
            reason: "Continuing Education Course",
          },
        ],
      },
      {
        firstName: "David",
        lastName: "Wilson",
        email: "dr.david@carepoint.lu",
        phone: "+352 621 001 004",
        specialty: "Orthopedics",
        role: UserRole.DOCTOR,
        socialMedia: {
          facebook: "https://www.facebook.com/mayoclinic",
          twitter: "https://twitter.com/MayoClinic",
          linkedin: "https://www.linkedin.com/company/mayo-clinic",
          instagram: "https://www.instagram.com/mayoclinic",
        },
        vacations: [
          {
            startDate: formatDate(addDays(currentDate, 45)),
            endDate: formatDate(addDays(currentDate, 52)),
            reason: "Winter Break",
          },
        ],
      },
      {
        firstName: "Lisa",
        lastName: "Thompson",
        email: "dr.lisa@carepoint.lu",
        phone: "+352 621 001 005",
        specialty: "Pediatrics",
        role: UserRole.DOCTOR,
        socialMedia: {
          facebook: "https://www.facebook.com/drmikevarshavski",
          twitter: "https://twitter.com/RealDoctorMike",
          instagram: "https://www.instagram.com/doctor.mike",
          linkedin: "https://www.linkedin.com/in/mikhail-varshavski",
        },
        vacations: [
          {
            startDate: formatDate(addDays(currentDate, 14)),
            endDate: formatDate(addDays(currentDate, 21)),
            reason: "Pediatrics Symposium in Brussels",
          },
          {
            startDate: formatDate(addDays(currentDate, 75)),
            endDate: formatDate(addDays(currentDate, 82)),
            reason: "Personal Leave",
          },
        ],
      },
      {
        firstName: "Robert",
        lastName: "Martinez",
        email: "dr.robert@carepoint.lu",
        phone: "+352 621 001 006",
        specialty: "Neurology",
        role: UserRole.DOCTOR,
        socialMedia: {
          facebook: "https://www.facebook.com/clevelandclinic",
          twitter: "https://twitter.com/ClevelandClinic",
          linkedin: "https://www.linkedin.com/company/cleveland-clinic",
          instagram: "https://www.instagram.com/clevelandclinic",
        },
        vacations: [],
      },
      {
        firstName: "Amanda",
        lastName: "Davis",
        email: "dr.amanda@carepoint.lu",
        phone: "+352 621 001 007",
        specialty: "Psychiatry",
        role: UserRole.DOCTOR,
        socialMedia: {
          facebook: "https://www.facebook.com/johnshopkinsmedicine",
          twitter: "https://twitter.com/HopkinsMedicine",
          linkedin: "https://www.linkedin.com/company/johns-hopkins-medicine",
          instagram: "https://www.instagram.com/johnshopkinsmedicine",
        },
        vacations: [
          {
            startDate: formatDate(addDays(currentDate, 10)),
            endDate: formatDate(addDays(currentDate, 12)),
            reason: "Mental Health Conference",
          },
        ],
      },
    ];

    const doctors = [];
    for (const doctorData of doctorsData) {
      const doctor = this.userRepository.create({
        ...doctorData,
        password,
        isActive: true,
      });
      const savedDoctor = await this.userRepository.save(doctor);
      doctors.push(savedDoctor);
    }

    console.log(`✅ Created ${doctors.length} doctors`);
    return doctors;
  }

  private async createPatients() {
    console.log("🧑‍🤝‍🧑 Creating patients...");
    const saltRounds = 10;
    const password = await bcrypt.hash("password123", saltRounds);

    const patientsData = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "+352 621 100 001",
        dateOfBirth: "1985-03-15",
        address: "123 Main Street, Luxembourg City, Luxembourg",
        emergencyContact: "Jane Smith",
        emergencyPhone: "+352 621 100 101",
      },
      {
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia@example.com",
        phone: "+352 621 100 002",
        dateOfBirth: "1990-07-22",
        address: "456 Oak Avenue, Esch-sur-Alzette, Luxembourg",
        emergencyContact: "Carlos Garcia",
        emergencyPhone: "+352 621 100 102",
      },
      {
        firstName: "Pierre",
        lastName: "Dubois",
        email: "pierre.dubois@example.com",
        phone: "+352 621 100 003",
        dateOfBirth: "1978-12-03",
        address: "789 Pine Road, Differdange, Luxembourg",
        emergencyContact: "Marie Dubois",
        emergencyPhone: "+352 621 100 103",
      },
      {
        firstName: "Anna",
        lastName: "Müller",
        email: "anna.muller@example.com",
        phone: "+352 621 100 004",
        dateOfBirth: "1992-09-18",
        address: "321 Cedar Lane, Dudelange, Luxembourg",
        emergencyContact: "Hans Müller",
        emergencyPhone: "+352 621 100 104",
      },
      {
        firstName: "Luca",
        lastName: "Rossi",
        email: "luca.rossi@example.com",
        phone: "+352 621 100 005",
        dateOfBirth: "1987-01-25",
        address: "654 Elm Street, Pétange, Luxembourg",
        emergencyContact: "Sofia Rossi",
        emergencyPhone: "+352 621 100 105",
      },
      {
        firstName: "Sophie",
        lastName: "Martin",
        email: "sophie.martin@example.com",
        phone: "+352 621 100 006",
        dateOfBirth: "1995-05-11",
        address: "987 Maple Drive, Ettelbruck, Luxembourg",
        emergencyContact: "Paul Martin",
        emergencyPhone: "+352 621 100 106",
      },
      {
        firstName: "Ahmed",
        lastName: "Hassan",
        email: "ahmed.hassan@example.com",
        phone: "+352 621 100 007",
        dateOfBirth: "1983-11-08",
        address: "147 Birch Court, Grevenmacher, Luxembourg",
        emergencyContact: "Fatima Hassan",
        emergencyPhone: "+352 621 100 107",
      },
      {
        firstName: "Emma",
        lastName: "Johnson",
        email: "emma.johnson@example.com",
        phone: "+352 621 100 008",
        dateOfBirth: "1993-04-30",
        address: "258 Spruce Way, Remich, Luxembourg",
        emergencyContact: "James Johnson",
        emergencyPhone: "+352 621 100 108",
      },
      {
        firstName: "Thomas",
        lastName: "Weber",
        email: "thomas.weber@example.com",
        phone: "+352 621 100 009",
        dateOfBirth: "1976-08-14",
        address: "369 Willow Street, Mersch, Luxembourg",
        emergencyContact: "Petra Weber",
        emergencyPhone: "+352 621 100 109",
      },
      {
        firstName: "Isabella",
        lastName: "Lopez",
        email: "isabella.lopez@example.com",
        phone: "+352 621 100 010",
        dateOfBirth: "1989-02-28",
        address: "741 Poplar Road, Vianden, Luxembourg",
        emergencyContact: "Miguel Lopez",
        emergencyPhone: "+352 621 100 110",
      },
    ];

    const patients = [];
    for (const patientData of patientsData) {
      const patient = this.clientRepository.create({
        ...patientData,
        password,
        isActive: true,
      });
      const savedPatient = await this.clientRepository.save(patient);
      patients.push(savedPatient);
    }

    console.log(`✅ Created ${patients.length} patients`);
    return patients;
  }

  private async createAppointments(doctors: User[], patients: Client[]) {
    console.log("📅 Creating appointments...");

    const appointmentTypes = [
      "General Consultation",
      "Follow-up Visit",
      "Routine Checkup",
      "Urgent Care",
      "Annual Physical",
      "Specialist Consultation",
    ];

    const appointmentTitles = [
      "Regular checkup",
      "Chest pain evaluation",
      "Skin rash examination",
      "Back pain consultation",
      "Headache assessment",
      "Blood pressure check",
      "Medication review",
      "Lab results discussion",
      "Allergy consultation",
      "Vaccination",
      "Physical therapy evaluation",
      "Cardiac screening",
      "Diabetes management",
      "Mental health assessment",
      "Pediatric wellness visit",
    ];

    const appointments = [];
    const currentDate = now();

    // Create appointments for the past month and next 3 months
    for (let i = 0; i < 50; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];

      // Generate random date within -30 to +90 days
      const randomDays = Math.floor(Math.random() * 120) - 30;
      let appointmentDate = addDays(currentDate, randomDays);

      // Set random time during business hours (9 AM to 5 PM)
      const hour = Math.floor(Math.random() * 8) + 9; // 9-16 (9 AM to 4 PM)
      const minute = Math.random() < 0.5 ? 0 : 30; // Either :00 or :30

      appointmentDate.setHours(hour, minute, 0, 0);

      // Duration: 20, 30, 45, or 60 minutes
      const durations = [20, 30, 45, 60];
      const duration = durations[Math.floor(Math.random() * durations.length)];

      // Ensure startTime and endTime are always valid Date objects
      const startTime = new Date(appointmentDate);
      if (isNaN(startTime.getTime())) {
        console.warn(`⚠️ Invalid startTime generated, using current date + ${randomDays} days`);
        startTime.setTime(currentDate.getTime() + randomDays * 24 * 60 * 60 * 1000);
        startTime.setHours(hour, minute, 0, 0);
      }

      const endTime = addMinutes(startTime, duration);
      if (isNaN(endTime.getTime())) {
        console.warn(`⚠️ Invalid endTime generated, using startTime + ${duration} minutes`);
        endTime.setTime(startTime.getTime() + duration * 60000);
      }

      // Validate dates before creating appointment
      if (!startTime || !endTime || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.error(`❌ Skipping appointment ${i + 1}: Invalid dates`, {
          startTime,
          endTime,
        });
        continue;
      }

      // Determine status based on date
      let status: AppointmentStatus;
      if (appointmentDate < currentDate) {
        // Past appointments - mostly completed
        const pastStatuses = [
          AppointmentStatus.COMPLETED,
          AppointmentStatus.COMPLETED,
          AppointmentStatus.COMPLETED,
          AppointmentStatus.NO_SHOW,
        ];
        status = pastStatuses[Math.floor(Math.random() * pastStatuses.length)];
      } else {
        // Future appointments
        const futureStatuses = [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.PENDING,
        ];
        status =
          futureStatuses[Math.floor(Math.random() * futureStatuses.length)];
      }

      try {
        const appointment = this.appointmentRepository.create({
          doctor,
          patient,
          startTime,
          endTime,
          status,
          type: appointmentTypes[
            Math.floor(Math.random() * appointmentTypes.length)
          ],
          title:
            appointmentTitles[
              Math.floor(Math.random() * appointmentTitles.length)
            ],
          description: `${appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)]} with Dr. ${doctor.firstName} ${doctor.lastName}`,
          notes: Math.random() > 0.7 ? "Please arrive 15 minutes early" : null,
          fee: Math.round((Math.random() * 200 + 50) * 100) / 100, // $50-$250
        });

        // Double-check that dates are valid before saving
        if (!appointment.startTime || !appointment.endTime) {
          console.error(`❌ Skipping appointment ${i + 1}: Missing dates in created object`);
          continue;
        }

        const savedAppointment =
          await this.appointmentRepository.save(appointment);
        
        // Verify saved appointment has valid dates
        if (!savedAppointment.startTime || !savedAppointment.endTime) {
          console.error(`❌ Warning: Saved appointment ${savedAppointment.id} has NULL dates`);
          // Delete the invalid appointment
          await this.appointmentRepository.remove(savedAppointment);
          continue;
        }

        appointments.push(savedAppointment);
      } catch (error) {
        console.error(`❌ Error creating appointment ${i + 1}:`, error);
        // Continue with next appointment instead of failing entire seed
        continue;
      }
    }

    console.log(`✅ Created ${appointments.length} appointments`);
    return appointments;
  }

  async printSeedSummary() {
    const doctorCount = await this.userRepository.count();
    const patientCount = await this.clientRepository.count();
    const appointmentCount = await this.appointmentRepository.count();

    console.log("\n📊 Seed Summary:");
    console.log(`👩‍⚕️ Doctors: ${doctorCount}`);
    console.log(`🧑‍🤝‍🧑 Patients: ${patientCount}`);
    console.log(`📅 Appointments: ${appointmentCount}`);
    console.log("\n🔐 Login Credentials:");
    console.log("Password for all users: password123");
    console.log("\n👩‍⚕️ Sample Doctor Logins:");
    console.log("- dr.sarah@carepoint.lu (Cardiology)");
    console.log("- dr.michael@carepoint.lu (Internal Medicine)");
    console.log("- dr.emily@carepoint.lu (Dermatology)");
    console.log("\n🧑‍🤝‍🧑 Sample Patient Logins:");
    console.log("- john.smith@example.com");
    console.log("- maria.garcia@example.com");
    console.log("- pierre.dubois@example.com");
    console.log("\n🌐 Frontend URLs:");
    console.log("- Doctor Portal: http://localhost:3000");
    console.log("- Patient Portal: http://localhost:3002");
  }
}
