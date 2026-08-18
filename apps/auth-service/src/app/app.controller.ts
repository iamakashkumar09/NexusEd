import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('Register')
  async register(data: any) {
    return this.appService.register(data);
  }

  @MessagePattern('Login')
  async login(data: any) {
    return this.appService.login(data);
  }

  @MessagePattern('RefreshToken')
  async refreshToken(data: { userId: string, refreshToken: string }) {
    return this.appService.refreshToken(data);
  }

  @MessagePattern('ForgotPassword')
  async forgotPassword(data: any) {
    return this.appService.forgotPassword(data);
  }

  @MessagePattern('VerifyOtp')
  async verifyOtp(data: any) {
    return this.appService.verifyOtp(data);
  }

  @MessagePattern('ResetPassword')
  async resetPassword(data: any) {
    return this.appService.resetPassword(data);
  }
}
