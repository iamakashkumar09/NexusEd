/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env from source directory
dotenv.config({ path: join(__dirname, '../../../apps/auth-service/.env') });

import { AppModule } from './app/app.module';

import { URL } from 'url';
const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');

async function bootstrap() {
  const port = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port, 10) || 6379,
      password: redisUrl.password,
      username: redisUrl.username,
      tls: redisUrl.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
    } as any,
  });

  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');
  console.log(`Auth Microservice is listening on port ${port} with Redis connected`);
}

bootstrap();
