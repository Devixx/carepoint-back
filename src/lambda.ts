import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configure as serverlessExpress } from "@vendia/serverless-express";
import { INestApplication } from "@nestjs/common";

let cachedServer: any;

async function bootstrap(): Promise<any> {
  if (!cachedServer) {
    const app: INestApplication = await NestFactory.create(AppModule);

    // Enable CORS for your Amplify domains
    app.enableCors({
      origin: [
        /\.amplifyapp\.com$/,
        "http://localhost:3000",
        "http://localhost:3002",
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    });

    await app.init();
    cachedServer = serverlessExpress({
      app: app.getHttpAdapter().getInstance(),
    });
  }
  return cachedServer;
}

export const handler = async (event: any, context: any) => {
  const server = await bootstrap();
  return server(event, context);
};
