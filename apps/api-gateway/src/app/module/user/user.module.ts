import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user.controller';

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
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.REDIS,
        options: redisOptions as any,
      },
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
