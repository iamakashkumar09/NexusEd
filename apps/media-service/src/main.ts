import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env from source directory
dotenv.config({ path: join(__dirname, '../../../apps/media-service/.env') });

import { AppModule } from './app/app.module';

async function bootstrap() {
  const port = process.env.PORT || 5004;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'media',
      protoPath: join(__dirname, '../../../libs/shared/proto/media.proto'),
      url: `0.0.0.0:${port}`,
    },
  });

  await app.listen();
  console.log(`Media Microservice is listening on port ${port}`);
}

bootstrap();
