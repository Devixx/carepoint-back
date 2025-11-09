import { NestFactory, Reflector } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { AppModule } from "./app.module";
import express from "express";
import { configure as serverlessExpress } from "@vendia/serverless-express";

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // Enable class serialization (for @Exclude() decorator)
    nestApp.useGlobalInterceptors(new ClassSerializerInterceptor(nestApp.get(Reflector)));

    // Enable CORS for Lambda
    nestApp.enableCors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "X-Api-Key",
        "X-Amz-Date",
        "X-Amz-Security-Token",
      ],
      credentials: true,
    });

    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer(event, context);
};
