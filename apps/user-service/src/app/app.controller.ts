import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('GetProfile')
  async getProfile(data: { userId: string }) {
    return this.appService.getProfile(data);
  }

  @MessagePattern('UpdateProfile')
  async updateProfile(data: any) {
    return this.appService.updateProfile(data);
  }
}
