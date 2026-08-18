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
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../libs/shared/proto/auth.proto'),
      url: '0.0.0.0:5000', // auth-service runs on 5000
    },
  });

  await app.startAllMicroservices();

  // Dummy HTTP health check for Render Web Services
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req, res) => res.send('OK'));

  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`Auth hybrid service: HTTP on port ${port}, gRPC on 5000`);
}

bootstrap();
