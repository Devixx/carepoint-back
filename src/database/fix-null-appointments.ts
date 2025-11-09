/**
 * Script to fix appointments with NULL startTime/endTime
 * Run this script to clean up invalid appointment data
 * 
 * Usage: ts-node -r tsconfig-paths/register src/database/fix-null-appointments.ts
 */

import { DataSource } from "typeorm";
import { ConfigModule } from "@nestjs/config";

ConfigModule.forRoot();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || "5432"),
  username: process.env.DATABASE_USERNAME || process.env.DB_USERNAME || "postgres",
  password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || "password",
  database: process.env.DATABASE_NAME || process.env.DB_NAME || "carepoint_db",
  entities: ["src/**/*.entity{.ts,.js}"],
  synchronize: false,
  logging: true,
});

async function fixNullAppointments() {
  try {
    await AppDataSource.initialize();
    console.log("🔌 Connected to database");

    // Step 1: First, make sure columns allow NULL (in case they don't)
    console.log("📝 Step 1: Ensuring columns allow NULL values...");
    try {
      await AppDataSource.query(`
        ALTER TABLE appointments 
        ALTER COLUMN "startTime" DROP NOT NULL,
        ALTER COLUMN "endTime" DROP NOT NULL
      `);
      console.log("✅ Columns now allow NULL values");
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("column") && error.message.includes("does not have")) {
        console.log("ℹ️ Columns already allow NULL or constraint doesn't exist");
      } else {
        console.warn("⚠️ Could not alter columns (this is OK if they already allow NULL):", error.message);
      }
    }

    // Step 2: Check how many appointments have NULL values
    console.log("📊 Step 2: Checking for appointments with NULL dates...");
    const countResult = await AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM appointments 
      WHERE "startTime" IS NULL OR "endTime" IS NULL
    `);
    const count = parseInt(countResult[0]?.count || "0");
    console.log(`📊 Found ${count} appointments with NULL dates`);

    if (count === 0) {
      console.log("✅ No appointments with NULL dates found. Database is clean!");
      
      // Step 3: Now we can safely make columns NOT NULL
      console.log("📝 Step 3: Making columns NOT NULL...");
      try {
        await AppDataSource.query(`
          ALTER TABLE appointments 
          ALTER COLUMN "startTime" SET NOT NULL,
          ALTER COLUMN "endTime" SET NOT NULL
        `);
        console.log("✅ Columns are now NOT NULL");
      } catch (error: any) {
        console.warn("⚠️ Could not set NOT NULL constraint:", error.message);
      }
      
      await AppDataSource.destroy();
      return;
    }

    // Step 3: Delete appointments with NULL startTime or endTime (recommended)
    console.log("🗑️ Step 3: Deleting appointments with NULL dates...");
    const deleteResult = await AppDataSource.query(`
      DELETE FROM appointments 
      WHERE "startTime" IS NULL OR "endTime" IS NULL
    `);
    const deletedCount = deleteResult[1] || count;
    console.log(`✅ Deleted ${deletedCount} appointments with NULL dates`);

    // Step 4: Verify deletion
    console.log("🔍 Step 4: Verifying deletion...");
    const verifyResult = await AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM appointments 
      WHERE "startTime" IS NULL OR "endTime" IS NULL
    `);
    const remaining = parseInt(verifyResult[0]?.count || "0");
    if (remaining > 0) {
      console.warn(`⚠️ Warning: ${remaining} appointments with NULL dates still exist`);
    } else {
      console.log("✅ Verified: No appointments with NULL dates remain");
      
      // Step 5: Now we can safely make columns NOT NULL
      console.log("📝 Step 5: Making columns NOT NULL...");
      try {
        await AppDataSource.query(`
          ALTER TABLE appointments 
          ALTER COLUMN "startTime" SET NOT NULL,
          ALTER COLUMN "endTime" SET NOT NULL
        `);
        console.log("✅ Columns are now NOT NULL");
      } catch (error: any) {
        console.warn("⚠️ Could not set NOT NULL constraint:", error.message);
      }
    }

    // Option 2: Alternatively, you could update them with a default date
    // Uncomment the following if you want to keep the appointments:
    /*
    const updateResult = await AppDataSource.query(`
      UPDATE appointments 
      SET 
        "startTime" = COALESCE("startTime", NOW() + INTERVAL '1 day'),
        "endTime" = COALESCE("endTime", NOW() + INTERVAL '1 day 30 minutes')
      WHERE "startTime" IS NULL OR "endTime" IS NULL
    `);
    console.log(`✅ Updated ${updateResult[1] || 0} appointments with default dates`);
    */

    await AppDataSource.destroy();
    console.log("✅ Database connection closed");
    console.log("✅ You can now restart your application");
  } catch (error) {
    console.error("❌ Error fixing appointments:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

fixNullAppointments();

