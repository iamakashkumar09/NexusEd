import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';

function getGrpcConfig(hostVar: string | undefined, defaultPort: string) {
  if (hostVar && !hostVar.includes('0.0.0.0') && !hostVar.includes('localhost')) {
    const host = hostVar.includes('onrender.com') ? hostVar : `${hostVar}.onrender.com`;
    return {
      url: `${host}:443`,
      credentials: grpc.credentials.createSsl(),
    };
  }
  return {
    url: hostVar ? `${hostVar}:${defaultPort}` : `0.0.0.0:${defaultPort}`,
  };
}

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './module/auth/auth.controller';
import { JwtStrategy } from './module/auth/strategies/jwt.strategy';
import { UserModule } from './module/user/user.module';
import { CourseController } from './module/course/course.controller';
import { MediaController } from './module/media/media.controller';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../../../libs/shared/proto/auth.proto'),
          ...getGrpcConfig(process.env.AUTH_SERVICE_HOST, '5000'),
        },
      },
      {
        name: 'COURSE_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'course',
          protoPath: join(__dirname, '../../../libs/shared/proto/course.proto'),
          ...getGrpcConfig(process.env.COURSE_SERVICE_HOST, '5002'),
        },
      },
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'media',
          protoPath: join(__dirname, '../../../libs/shared/proto/media.proto'),
          ...getGrpcConfig(process.env.MEDIA_SERVICE_HOST, '5004'),
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController, CourseController, MediaController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }
