import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { RabbitService } from './rabbit.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, RabbitService],
})
export class AppModule {}
