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
  
  // Dummy HTTP health check for Render Web Services
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req, res) => res.send('OK'));

  const port = process.env.PORT || 5003;
  await app.listen(port); // media-service HTTP runs on PORT or 5003
  
  console.log(`Media microservice HTTP is listening on port ${port}`);
  console.log('Media microservice gRPC is listening on port 5004');
}

bootstrap();

