import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';

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
          url: process.env.AUTH_SERVICE_URL || '0.0.0.0:5000',
        },
      },
      {
        name: 'COURSE_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'course',
          protoPath: join(__dirname, '../../../libs/shared/proto/course.proto'),
          url: process.env.COURSE_SERVICE_URL || '0.0.0.0:5002',
        },
      },
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'media',
          protoPath: join(__dirname, '../../../libs/shared/proto/media.proto'),
          url: process.env.MEDIA_SERVICE_URL || '0.0.0.0:5004',
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController, CourseController, MediaController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }
