/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env from source directory
dotenv.config({ path: join(__dirname, '../../../apps/user-service/.env') });

import { AppModule } from './app/app.module';

async function bootstrap() {
  const port = process.env.PORT || 5001;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '../../../libs/shared/proto/user.proto'),
      url: `0.0.0.0:${port}`,
    },
  });

  await app.listen();
  console.log(`User Microservice is listening on port ${port}`);
}

bootstrap();
