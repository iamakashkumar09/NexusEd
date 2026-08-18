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

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(data: { userId: string, refreshToken: string }) {
    return this.appService.refreshToken(data);
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  async forgotPassword(data: any) {
    return this.appService.forgotPassword(data);
  }

  @GrpcMethod('AuthService', 'VerifyOtp')
  async verifyOtp(data: any) {
    return this.appService.verifyOtp(data);
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(data: any) {
    return this.appService.resetPassword(data);
  }
}
