import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.REDIS,
        options: { url: process.env.REDIS_URL || 'redis://localhost:6379' } as any,
      },
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
