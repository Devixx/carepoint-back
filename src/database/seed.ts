import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { SeedService } from "./seed.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seed();
    await seedService.printSeedSummary();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});
