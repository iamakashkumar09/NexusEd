import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env from source directory
dotenv.config({ path: join(__dirname, '../../../apps/course-service/.env') });

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'course',
      protoPath: join(__dirname, '../../../libs/shared/proto/course.proto'),
      url: '0.0.0.0:5002', // course-service runs on 5002
    },
  });

  await app.startAllMicroservices();

  // Dummy HTTP health check for Render Web Services
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req, res) => res.send('OK'));

  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`Course hybrid service: HTTP on port ${port}, gRPC on 5002`);
}

bootstrap();
