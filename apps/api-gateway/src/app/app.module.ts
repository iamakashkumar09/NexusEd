import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './module/auth/auth.controller';
import { JwtStrategy } from './module/auth/strategies/jwt.strategy';
import { UserModule } from './module/user/user.module';
import { CourseController } from './module/course/course.controller';
import { MediaController } from './module/media/media.controller';

import { URL } from 'url';
const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
const redisOptions = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port, 10) || 6379,
  password: redisUrl.password,
  username: redisUrl.username,
  tls: redisUrl.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
};

@Module({
  imports: [
    UserModule,
    PassportModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.REDIS,
        options: redisOptions as any,
      },
      {
        name: 'COURSE_SERVICE',
        transport: Transport.REDIS,
        options: redisOptions as any,
      },
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.REDIS,
        options: redisOptions as any,
      },
    ]),
  ],
  controllers: [AppController, AuthController, CourseController, MediaController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }
