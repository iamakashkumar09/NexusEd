import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env from source directory
dotenv.config({ path: join(__dirname, '../../../apps/course-service/.env') });

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'course',
      protoPath: join(__dirname, '../../../libs/shared/proto/course.proto'),
      url: '0.0.0.0:5002', // course-service runs on 5002
    },
  });
  
  await app.listen();
  console.log('Course microservice is listening on port 5002');
}

bootstrap();
