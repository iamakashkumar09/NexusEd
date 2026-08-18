import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '../../../apps/media-service/.env') });

import { AppModule } from './app/app.module';

async function bootstrap() {
  const port = process.env.PORT || 5003;
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: { url: process.env.REDIS_URL || 'redis://localhost:6379' } as any,
  });

  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`Media Microservice is listening on port ${port} with Redis connected`);
}
bootstrap();
