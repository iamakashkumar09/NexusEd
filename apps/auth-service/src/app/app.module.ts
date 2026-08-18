import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

import { EmailService } from './email.service';

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
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-local-jwt-key',
      signOptions: { expiresIn: '1h' },
    }),
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
  controllers: [AppController],
  providers: [AppService, PrismaService, EmailService],
})
export class AppModule {}
