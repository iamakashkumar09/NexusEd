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

async function bootstrap() {
  const port = process.env.PORT || 5000;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../libs/shared/proto/auth.proto'),
      url: `0.0.0.0:${port}`,
    },
  });

  await app.listen();
  console.log(`Auth Microservice is listening on port ${port}`);
}

bootstrap();
