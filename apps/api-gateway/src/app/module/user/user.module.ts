import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserController } from './user.controller';
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

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../../libs/shared/proto/user.proto'),
          ...getGrpcConfig(process.env.USER_SERVICE_HOST, '5001'),
        },
      },
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
