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
    await this.clearDatabase();
    const doctors = await this.createDoctors();
    const patients = await this.createPatients();
    await this.createAppointments(doctors, patients);
    console.log("✅ Database seeding completed successfully!");
  }

  private async clearDatabase() {
    console.log("🧹 Clearing existing data...");
    try {
      await this.appointmentRepository.clear();
      await this.clientRepository.clear();
      await this.userRepository.clear();
      console.log("✅ Database cleared");
    } catch {
      try {
        await this.appointmentRepository.createQueryBuilder().delete().execute();
        await this.clientRepository.createQueryBuilder().delete().execute();
        await this.userRepository.createQueryBuilder().delete().execute();
        console.log("✅ Database cleared via query builder");
      } catch {
        await this.appointmentRepository.query("TRUNCATE TABLE appointments CASCADE");
        await this.clientRepository.query("TRUNCATE TABLE clients CASCADE");
        await this.userRepository.query("TRUNCATE TABLE users CASCADE");
        console.log("✅ Database cleared via SQL");
      }
    }
  }

  private async createDoctors() {
    console.log("👩‍⚕️ Creating doctors...");
    const password = await bcrypt.hash("password123", 10);
    const currentDate = now();
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const workingHoursMonFri = {
      1: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
      2: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
      3: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
      4: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
      5: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
      0: { isAvailable: false },
      6: { isAvailable: false },
    };

    const workingHoursEarly = {
      1: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
      2: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
      3: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
      4: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
      5: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
      0: { isAvailable: false },
      6: { isAvailable: false },
    };

    const doctorsData = [
      // ── Existing doctors enriched ──────────────────────────────────────
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "dr.sarah@carepoint.lu",
        phone: "+352 621 001 001",
        specialty: "Cardiology",
        role: UserRole.DOCTOR,
        address: "4 Rue Ernest Barblé",
        city: "Luxembourg City",
        zipCode: "1210",
        country: "Luxembourg",
        latitude: 49.6000,
        longitude: 6.1296,
        bio: "Cardiologue avec 15 ans d'expérience, spécialisée dans la prévention et le traitement des maladies cardiovasculaires. Certifiée par l'European Board of Cardiology.",
        acceptsCNS: true,
        acceptsVideo: false,
        rating: 4.7,
        reviewCount: 134,
        languages: ["EN", "FR", "LB"],
        workingHoursDisplay: "Lun–Ven  08:00–17:00",
        workingHours: workingHoursMonFri,
        vacations: [
          { startDate: fmt(addDays(currentDate, 7)), endDate: fmt(addDays(currentDate, 14)), reason: "Annual Leave" },
          { startDate: fmt(addDays(currentDate, 60)), endDate: fmt(addDays(currentDate, 67)), reason: "Medical Conference in Geneva" },
        ],
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        email: "dr.michael@carepoint.lu",
        phone: "+352 621 001 002",
        specialty: "Internal Medicine",
        role: UserRole.DOCTOR,
        address: "120 Route d'Esch",
        city: "Esch-sur-Alzette",
        zipCode: "4010",
        country: "Luxembourg",
        latitude: 49.4958,
        longitude: 5.9806,
        bio: "Interniste généraliste expert dans la gestion des maladies chroniques, du diabète et de l'hypertension. Consultations disponibles en quatre langues.",
        acceptsCNS: true,
        acceptsVideo: true,
        rating: 4.5,
        reviewCount: 89,
        languages: ["EN", "FR", "DE", "LB"],
        workingHoursDisplay: "Lun–Ven  09:00–18:00",
        workingHours: workingHoursEarly,
        vacations: [
          { startDate: fmt(addDays(currentDate, 21)), endDate: fmt(addDays(currentDate, 25)), reason: "Family Holiday" },
        ],
      },
      {
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "dr.emily@carepoint.lu",
        phone: "+352 621 001 003",
        specialty: "Dermatology",
        role: UserRole.DOCTOR,
        address: "1 Rue Emile Mayrisch",
        city: "Esch-sur-Alzette",
        zipCode: "4240",
        country: "Luxembourg",
        latitude: 49.4944,
        longitude: 5.9811,
        bio: "Dermatologue certifiée spécialisée dans l'acné, l'eczéma, le psoriasis et le dépistage du cancer de la peau. Formée à Paris et membre de la Société Française de Dermatologie.",
        acceptsCNS: true,
        acceptsVideo: true,
        rating: 4.8,
        reviewCount: 201,
        languages: ["EN", "FR"],
        workingHoursDisplay: "Lun, Mer, Ven  09:00–17:00",
        workingHours: {
          1: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
          3: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
          5: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
          0: { isAvailable: false }, 2: { isAvailable: false },
          4: { isAvailable: false }, 6: { isAvailable: false },
        },
        vacations: [
          { startDate: fmt(addDays(currentDate, 30)), endDate: fmt(addDays(currentDate, 44)), reason: "Continuing Education" },
        ],
      },
      {
        firstName: "David",
        lastName: "Wilson",
        email: "dr.david@carepoint.lu",
        phone: "+352 621 001 004",
        specialty: "Orthopedics",
        role: UserRole.DOCTOR,
        address: "2 Rue Michel Welter",
        city: "Differdange",
        zipCode: "4530",
        country: "Luxembourg",
        latitude: 49.5244,
        longitude: 5.8910,
        bio: "Chirurgien orthopédiste spécialisé dans les blessures sportives, les remplacements articulaires et les pathologies de la colonne vertébrale. Ancien chirurgien du Luxembourg Rugby.",
        acceptsCNS: true,
        acceptsVideo: false,
        rating: 4.6,
        reviewCount: 156,
        languages: ["EN", "FR", "DE"],
        workingHoursDisplay: "Mar–Sam  08:30–16:30",
        workingHours: {
          2: { isAvailable: true, startTime: "08:30", endTime: "16:30" },
          3: { isAvailable: true, startTime: "08:30", endTime: "16:30" },
          4: { isAvailable: true, startTime: "08:30", endTime: "16:30" },
          5: { isAvailable: true, startTime: "08:30", endTime: "16:30" },
          6: { isAvailable: true, startTime: "08:30", endTime: "13:00" },
          0: { isAvailable: false }, 1: { isAvailable: false },
        },
        vacations: [
          { startDate: fmt(addDays(currentDate, 45)), endDate: fmt(addDays(currentDate, 52)), reason: "Winter Break" },
        ],
      },
      {
        firstName: "Lisa",
        lastName: "Thompson",
        email: "dr.lisa@carepoint.lu",
        phone: "+352 621 001 005",
        specialty: "Pediatrics",
        role: UserRole.DOCTOR,
        address: "271 Route d'Arlon",
        city: "Strassen",
        zipCode: "8011",
        country: "Luxembourg",
        latitude: 49.6205,
        longitude: 6.0749,
        bio: "Pédiatre prenant en charge les enfants de la naissance à l'adolescence. Intérêt particulier pour la pédiatrie du développement et la nutrition infantile.",
        acceptsCNS: true,
        acceptsVideo: true,
        rating: 4.9,
        reviewCount: 312,
        languages: ["EN", "FR", "LB"],
        workingHoursDisplay: "Lun–Ven  08:00–16:00",
        workingHours: workingHoursMonFri,
        vacations: [
          { startDate: fmt(addDays(currentDate, 14)), endDate: fmt(addDays(currentDate, 21)), reason: "Pediatrics Symposium Brussels" },
          { startDate: fmt(addDays(currentDate, 75)), endDate: fmt(addDays(currentDate, 82)), reason: "Personal Leave" },
        ],
      },
      {
        firstName: "Robert",
        lastName: "Martinez",
        email: "dr.robert@carepoint.lu",
        phone: "+352 621 001 006",
        specialty: "Neurology",
        role: UserRole.DOCTOR,
        address: "120 Avenue Salentiny",
        city: "Ettelbruck",
        zipCode: "9080",
        country: "Luxembourg",
        latitude: 49.8472,
        longitude: 6.1042,
        bio: "Neurologue spécialisé dans les céphalées, l'épilepsie et la sclérose en plaques. Référence régionale pour le nord du Luxembourg. Consultations sur ordonnance de spécialiste.",
        acceptsCNS: true,
        acceptsVideo: false,
        rating: 4.4,
        reviewCount: 67,
        languages: ["EN", "FR", "DE", "LB"],
        workingHoursDisplay: "Lun, Mar, Jeu  09:00–17:00",
        workingHours: {
          1: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
          2: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
          4: { isAvailable: true, startTime: "09:00", endTime: "17:00" },
          0: { isAvailable: false }, 3: { isAvailable: false },
          5: { isAvailable: false }, 6: { isAvailable: false },
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
        address: "9 Rue Edward Steichen",
        city: "Kirchberg",
        zipCode: "2540",
        country: "Luxembourg",
        latitude: 49.6319,
        longitude: 6.1750,
        bio: "Psychiatre avec expertise dans l'anxiété, la dépression et le burn-out. Cabinet privé — remboursement partiel CNS avec ordonnance de médecin généraliste. Téléconsultations disponibles.",
        acceptsCNS: false,
        acceptsVideo: true,
        rating: 4.8,
        reviewCount: 44,
        languages: ["EN", "FR"],
        workingHoursDisplay: "Lun–Jeu  10:00–18:00",
        workingHours: {
          1: { isAvailable: true, startTime: "10:00", endTime: "18:00" },
          2: { isAvailable: true, startTime: "10:00", endTime: "18:00" },
          3: { isAvailable: true, startTime: "10:00", endTime: "18:00" },
          4: { isAvailable: true, startTime: "10:00", endTime: "18:00" },
          0: { isAvailable: false }, 5: { isAvailable: false },
          6: { isAvailable: false },
        },
        vacations: [
          { startDate: fmt(addDays(currentDate, 10)), endDate: fmt(addDays(currentDate, 12)), reason: "Mental Health Conference" },
        ],
      },
      // ── New doctors ────────────────────────────────────────────────────
      {
        firstName: "Jean-Paul",
        lastName: "Schmit",
        email: "dr.jeanpaul@carepoint.lu",
        phone: "+352 621 001 008",
        specialty: "General Practice",
        role: UserRole.DOCTOR,
        address: "14 Boulevard Royal",
        city: "Luxembourg City",
        zipCode: "2449",
        country: "Luxembourg",
        latitude: 49.6116,
        longitude: 6.1319,
        bio: "Médecin généraliste au cœur de Luxembourg-Ville. Premier interlocuteur pour toutes vos questions de santé. Ordonnances CNS, vaccinations et certificats médicaux.",
        acceptsCNS: true,
        acceptsVideo: true,
        rating: 4.3,
        reviewCount: 278,
        languages: ["FR", "DE", "LB"],
        workingHoursDisplay: "Lun–Ven  08:00–18:00",
        workingHours: workingHoursEarly,
        vacations: [],
      },
      {
        firstName: "Sophie",
        lastName: "Müller",
        email: "dr.sophie@carepoint.lu",
        phone: "+352 621 001 009",
        specialty: "Gynecology",
        role: UserRole.DOCTOR,
        address: "3 Rue Erasme",
        city: "Kirchberg",
        zipCode: "1468",
        country: "Luxembourg",
        latitude: 49.6293,
        longitude: 6.1694,
        bio: "Gynécologue spécialisée en suivi de grossesse, contraception et ménopause. Approche bienveillante et attentive. Équipement échographique de dernière génération.",
        acceptsCNS: true,
        acceptsVideo: false,
        rating: 4.7,
        reviewCount: 183,
        languages: ["FR", "DE", "LB", "EN"],
        workingHoursDisplay: "Lun–Ven  09:00–17:00",
        workingHours: workingHoursMonFri,
        vacations: [
          { startDate: fmt(addDays(currentDate, 35)), endDate: fmt(addDays(currentDate, 39)), reason: "OB/GYN Congress" },
        ],
      },
      {
        firstName: "Marc",
        lastName: "Leclercq",
        email: "dr.marc@carepoint.lu",
        phone: "+352 621 001 010",
        specialty: "Ophthalmology",
        role: UserRole.DOCTOR,
        address: "25 Rue du Fossé",
        city: "Luxembourg City",
        zipCode: "1536",
        country: "Luxembourg",
        latitude: 49.6095,
        longitude: 6.1300,
        bio: "Ophtalmologiste spécialisé dans les troubles réfractifs, les cataractes et le glaucome. Équipement diagnostique de pointe. Remboursement CNS disponible.",
        acceptsCNS: true,
        acceptsVideo: false,
        rating: 4.5,
        reviewCount: 92,
        languages: ["FR", "LB", "DE"],
        workingHoursDisplay: "Mar–Ven  09:00–17:30",
        workingHours: {
          2: { isAvailable: true, startTime: "09:00", endTime: "17:30" },
          3: { isAvailable: true, startTime: "09:00", endTime: "17:30" },
          4: { isAvailable: true, startTime: "09:00", endTime: "17:30" },
          5: { isAvailable: true, startTime: "09:00", endTime: "17:30" },
          0: { isAvailable: false }, 1: { isAvailable: false },
          6: { isAvailable: false },
        },
        vacations: [],
      },
      {
        firstName: "Anna",
        lastName: "Kohler",
        email: "dr.anna@carepoint.lu",
        phone: "+352 621 001 011",
        specialty: "General Practice",
        role: UserRole.DOCTOR,
        address: "12 Rue de la Libération",
        city: "Dudelange",
        zipCode: "3506",
        country: "Luxembourg",
        latitude: 49.4803,
        longitude: 6.0874,
        bio: "Médecin de famille à Dudelange depuis 10 ans. Spécialisée en médecine préventive, maladies chroniques et gériatrie. Parle couramment le français, l'allemand et le luxembourgeois.",
        acceptsCNS: true,
        acceptsVideo: true,
        rating: 4.6,
        reviewCount: 145,
        languages: ["FR", "DE", "LB"],
        workingHoursDisplay: "Lun–Ven  08:30–17:30",
        workingHours: {
          1: { isAvailable: true, startTime: "08:30", endTime: "17:30" },
          2: { isAvailable: true, startTime: "08:30", endTime: "17:30" },
          3: { isAvailable: true, startTime: "08:30", endTime: "17:30" },
          4: { isAvailable: true, startTime: "08:30", endTime: "17:30" },
          5: { isAvailable: true, startTime: "08:30", endTime: "13:00" },
          0: { isAvailable: false }, 6: { isAvailable: false },
        },
        vacations: [],
      },
    ];

    const doctors: User[] = [];
    for (const data of doctorsData) {
      const doctor = this.userRepository.create({ ...data, password, isActive: true });
      doctors.push(await this.userRepository.save(doctor));
    }

    console.log(`✅ Created ${doctors.length} doctors`);
    return doctors;
  }

  private async createPatients() {
    console.log("🧑‍🤝‍🧑 Creating patients...");
    const password = await bcrypt.hash("password123", 10);

    const patientsData = [
      { firstName: "John", lastName: "Smith", email: "john.smith@example.com", phone: "+352 621 100 001", dateOfBirth: "1985-03-15", address: "123 Main Street, Luxembourg City", emergencyContact: "Jane Smith", emergencyPhone: "+352 621 100 101" },
      { firstName: "Maria", lastName: "Garcia", email: "maria.garcia@example.com", phone: "+352 621 100 002", dateOfBirth: "1990-07-22", address: "456 Oak Avenue, Esch-sur-Alzette", emergencyContact: "Carlos Garcia", emergencyPhone: "+352 621 100 102" },
      { firstName: "Pierre", lastName: "Dubois", email: "pierre.dubois@example.com", phone: "+352 621 100 003", dateOfBirth: "1978-12-03", address: "789 Pine Road, Differdange", emergencyContact: "Marie Dubois", emergencyPhone: "+352 621 100 103" },
      { firstName: "Anna", lastName: "Müller", email: "anna.muller@example.com", phone: "+352 621 100 004", dateOfBirth: "1992-09-18", address: "321 Cedar Lane, Dudelange", emergencyContact: "Hans Müller", emergencyPhone: "+352 621 100 104" },
      { firstName: "Luca", lastName: "Rossi", email: "luca.rossi@example.com", phone: "+352 621 100 005", dateOfBirth: "1987-01-25", address: "654 Elm Street, Pétange", emergencyContact: "Sofia Rossi", emergencyPhone: "+352 621 100 105" },
      { firstName: "Sophie", lastName: "Martin", email: "sophie.martin@example.com", phone: "+352 621 100 006", dateOfBirth: "1995-05-11", address: "987 Maple Drive, Ettelbruck", emergencyContact: "Paul Martin", emergencyPhone: "+352 621 100 106" },
      { firstName: "Ahmed", lastName: "Hassan", email: "ahmed.hassan@example.com", phone: "+352 621 100 007", dateOfBirth: "1983-11-08", address: "147 Birch Court, Grevenmacher", emergencyContact: "Fatima Hassan", emergencyPhone: "+352 621 100 107" },
      { firstName: "Emma", lastName: "Johnson", email: "emma.johnson@example.com", phone: "+352 621 100 008", dateOfBirth: "1993-04-30", address: "258 Spruce Way, Remich", emergencyContact: "James Johnson", emergencyPhone: "+352 621 100 108" },
      { firstName: "Thomas", lastName: "Weber", email: "thomas.weber@example.com", phone: "+352 621 100 009", dateOfBirth: "1976-08-14", address: "369 Willow Street, Mersch", emergencyContact: "Petra Weber", emergencyPhone: "+352 621 100 109" },
      { firstName: "Isabella", lastName: "Lopez", email: "isabella.lopez@example.com", phone: "+352 621 100 010", dateOfBirth: "1989-02-28", address: "741 Poplar Road, Vianden", emergencyContact: "Miguel Lopez", emergencyPhone: "+352 621 100 110" },
      { firstName: "Marouen", lastName: "Chaouechi", email: "test@carepoint.lu", phone: "+352 621 100 011", dateOfBirth: "1990-01-01", address: "1 Rue du Test, Luxembourg City", emergencyContact: "Emergency Contact", emergencyPhone: "+352 621 100 111" },
    ];

    const patients: Client[] = [];
    for (const data of patientsData) {
      const patient = this.clientRepository.create({ ...data, password, isActive: true });
      patients.push(await this.clientRepository.save(patient));
    }

    console.log(`✅ Created ${patients.length} patients`);
    return patients;
  }

  private async createAppointments(doctors: User[], patients: Client[]) {
    console.log("📅 Creating appointments...");

    const titles = [
      "Regular checkup", "Chest pain evaluation", "Skin rash examination",
      "Back pain consultation", "Headache assessment", "Blood pressure check",
      "Medication review", "Lab results discussion", "Allergy consultation",
      "Vaccination", "Annual physical", "Cardiac screening",
      "Diabetes follow-up", "Mental health check-in", "Pediatric wellness visit",
      "Prenatal follow-up", "Eye exam", "Dermatology screening",
    ];

    const types = ["In-Person", "Telehealth", "Follow-up"];
    const appointments: Appointment[] = [];
    const currentDate = now();

    for (let i = 0; i < 60; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const randomDays = Math.floor(Math.random() * 120) - 30;
      const apptDate = addDays(currentDate, randomDays);
      const hour = Math.floor(Math.random() * 8) + 9;
      const minute = Math.random() < 0.5 ? 0 : 30;
      apptDate.setHours(hour, minute, 0, 0);

      const duration = [20, 30, 45, 60][Math.floor(Math.random() * 4)];
      const startTime = new Date(apptDate);
      const endTime = addMinutes(startTime, duration);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) continue;

      let status: AppointmentStatus;
      if (apptDate < currentDate) {
        status = [AppointmentStatus.COMPLETED, AppointmentStatus.COMPLETED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW][Math.floor(Math.random() * 4)];
      } else {
        status = [AppointmentStatus.CONFIRMED, AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING][Math.floor(Math.random() * 3)];
      }

      try {
        const appointment = this.appointmentRepository.create({
          doctor,
          patient,
          startTime,
          endTime,
          status,
          type: types[Math.floor(Math.random() * types.length)],
          title: titles[Math.floor(Math.random() * titles.length)],
          description: `Consultation with Dr. ${doctor.firstName} ${doctor.lastName}`,
          notes: Math.random() > 0.7 ? "Please arrive 15 minutes early" : null,
          fee: Math.round((Math.random() * 150 + 50) * 100) / 100,
        });
        const saved = await this.appointmentRepository.save(appointment);
        if (saved.startTime && saved.endTime) appointments.push(saved);
      } catch (err) {
        console.error(`❌ Error creating appointment ${i + 1}:`, err);
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
    console.log("\n🔐 All passwords: password123");
    console.log("\n👩‍⚕️ Doctors:");
    console.log("  dr.sarah@carepoint.lu (Cardiology, CNS ✓, ★4.7)");
    console.log("  dr.michael@carepoint.lu (Internal Medicine, CNS ✓, ★4.5, Video ✓)");
    console.log("  dr.emily@carepoint.lu (Dermatology, CNS ✓, ★4.8)");
    console.log("  dr.david@carepoint.lu (Orthopedics, CNS ✓, ★4.6)");
    console.log("  dr.lisa@carepoint.lu (Pediatrics, CNS ✓, ★4.9, Video ✓)");
    console.log("  dr.robert@carepoint.lu (Neurology, CNS ✓, ★4.4)");
    console.log("  dr.amanda@carepoint.lu (Psychiatry, private, ★4.8, Video ✓)");
    console.log("  dr.jeanpaul@carepoint.lu (General Practice, CNS ✓, ★4.3, Video ✓)");
    console.log("  dr.sophie@carepoint.lu (Gynecology, CNS ✓, ★4.7)");
    console.log("  dr.marc@carepoint.lu (Ophthalmology, CNS ✓, ★4.5)");
    console.log("  dr.anna@carepoint.lu (General Practice, CNS ✓, ★4.6, Video ✓)");
    console.log("\n🧑‍🤝‍🧑 Test patient: test@carepoint.lu");
  }
}
