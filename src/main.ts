import { NestFactory, Reflector } from "@nestjs/core";
import { ValidationPipe, ClassSerializerInterceptor } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable class serialization (for @Exclude() decorator)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: [
      "http://localhost:3000", // carepoint-front (doctor interface)
      "http://localhost:3002", // carepoint-patient (patient interface)
      /\.amplifyapp\.com$/,
      /\.ngrok\.io$/,          // Add this for ngrok
      /\.ngrok-free\.app$/,    // Add this for newer ngrok free tier
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Api-Key",
    ],
    credentials: true,
  });

  await app.listen(3001);
  console.log("Backend running on http://localhost:3001");
  console.log("Serving both:");
  console.log("- Doctor interface (carepoint-front): http://localhost:3000");
  console.log("- Patient interface (carepoint-patient): http://localhost:3002");
}
bootstrap();
