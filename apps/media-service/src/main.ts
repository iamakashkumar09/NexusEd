import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env from source directory
dotenv.config({ path: join(__dirname, '../../../apps/media-service/.env') });

import { AppModule } from './app/app.module';

async function bootstrap() {
  // HTTP Server (for OAuth callback)
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  
  // gRPC Server (for internal communication)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'media',
      protoPath: join(__dirname, '../../../libs/shared/proto/media.proto'),
      url: '0.0.0.0:5004', // media-service gRPC runs on 5004
    },
  });

  await app.startAllMicroservices();
  await app.listen(5003); // media-service HTTP runs on 5003
  
  console.log('Media microservice HTTP is listening on port 5003');
  console.log('Media microservice gRPC is listening on port 5004');
}

bootstrap();

