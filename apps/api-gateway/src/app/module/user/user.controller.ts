import { Controller, Get, Put, Body, UseGuards, Request, Inject, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface UserService {
  GetProfile(data: { userId: string }): Observable<any>;
  UpdateProfile(data: any): Observable<any>;
}

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  

  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  

  @Get('profile')
  async getProfile(@Request() req: any) {
    try {
      const userId = req.user.userId;
      return await lastValueFrom(this.client.send('GetProfile', { userId }));
    } catch (error) {
      throw new HttpException(error.details || error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() body: UpdateProfileDto) {
    try {
      const userId = req.user.userId;
      const payload = {
        ...body,
        userId,
      };
      return await lastValueFrom(this.client.send('UpdateProfile', payload));
    } catch (error) {
      throw new HttpException(error.details || error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
