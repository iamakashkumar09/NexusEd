import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('UserService', 'GetProfile')
  async getProfile(data: { userId: string }) {
    return this.appService.getProfile(data);
  }

  @GrpcMethod('UserService', 'UpdateProfile')
  async updateProfile(data: any) {
    return this.appService.updateProfile(data);
  }
}
