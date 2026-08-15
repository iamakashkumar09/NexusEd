import { Controller, Post, Body, Inject, OnModuleInit, UseGuards, Get, Request, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { AuthResponse } from '@nexus-ed/shared-types';

interface AuthService {
  Register(data: any): Observable<AuthResponse>;
  Login(data: any): Observable<AuthResponse>;
  RefreshToken(data: any): Observable<AuthResponse>;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      return await lastValueFrom(this.authService.Register(body));
    } catch (error) {
      throw new HttpException(error.details || error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const response = await lastValueFrom(this.authService.Login(body));
      if (response.success && response.token) {
        res.cookie('token', response.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('refreshToken', response.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      }
      const { token, refreshToken, ...responseData } = response;
      return responseData;
    } catch (error) {
      throw new HttpException(error.details || error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    try {
      const response = await lastValueFrom(this.authService.RefreshToken(body));
      if (response.success && response.token) {
        res.cookie('token', response.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('refreshToken', response.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      }
      const { token, refreshToken, ...responseData } = response;
      return responseData;
    } catch (error) {
      throw new HttpException(error.details || error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user is set by the JwtStrategy
    return req.user;
  }
}
