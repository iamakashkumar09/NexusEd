import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: any) {
    return this.appService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: any) {
    return this.appService.login(data);
  }
}
