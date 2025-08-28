import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw if unknown properties provided
      transform: true, // Auto-transform primitives based on DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({ origin: "http://localhost:3000", credentials: true });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`CarePoint running on http://localhost:${port}`);
}
bootstrap();
