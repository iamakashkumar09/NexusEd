import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserController } from './user.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../../libs/shared/proto/user.proto'),
          url: process.env.USER_SERVICE_URL || '0.0.0.0:5001',
        },
      },
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
