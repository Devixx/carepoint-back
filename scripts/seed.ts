// scripts/seed.ts
import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "../src/users/entities/user.entity";
import { Client } from "../src/clients/entities/client.entity";
import { Appointment } from "../src/appointments/entities/appointment.entity";
import { AppDataSource } from "../src/database/data-source";

async function seed() {
  await AppDataSource.initialize();

  // TODO: create doctor (optional in bypass)
  // TODO: create patients & appointments

  console.log("Seed complete");
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
