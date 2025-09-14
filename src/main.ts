import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      "http://localhost:3000", // carepoint-front (doctor interface)
      "http://localhost:3002", // carepoint-patient (patient interface)
      "https://main.d32cx20r0uj9nu.amplifyapp.com/",
      "https://main.d27s5cfl90jfmd.amplifyapp.com/",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  await app.listen(3001);
  console.log("Backend running on http://localhost:3001");
  console.log("Serving both:");
  console.log("- Doctor interface (carepoint-front): http://localhost:3000");
  console.log("- Patient interface (carepoint-patient): http://localhost:3002");
}
bootstrap();
