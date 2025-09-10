import { DataSource } from "typeorm";
import { ConfigModule } from "@nestjs/config";

ConfigModule.forRoot();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || "postgres",
  password: process.env.DATABASE_PASSWORD || "password",
  database: process.env.DATABASE_NAME || "carepoint_db",
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["dist/database/migrations/*{.ts,.js}"],
  synchronize: process.env.NODE_ENV === "development",
  logging: true,
  dropSchema: true,
});
