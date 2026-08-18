import { Controller, Post, Body, Inject, OnModuleInit, UseGuards, Get, Request, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { AuthResponse } from '@nexus-ed/shared-types';

interface AuthService {
  Register(data: any): Observable<AuthResponse>;
  Login(data: any): Observable<AuthResponse>;
  RefreshToken(data: any): Observable<AuthResponse>;
  ForgotPassword(data: any): Observable<AuthResponse>;
  VerifyOtp(data: any): Observable<AuthResponse>;
  ResetPassword(data: any): Observable<AuthResponse>;
}

@Controller('auth')
export class AuthController {
  

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      return await lastValueFrom(this.client.send('Register', body));
    } catch (error) {
      throw new HttpException(error.details || error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const response = await lastValueFrom(this.client.send('Login', body));
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
      const response = await lastValueFrom(this.client.send('RefreshToken', body));
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

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    try {
      return await lastValueFrom(this.client.send('ForgotPassword', body));
    } catch (error) {
      throw new HttpException(error.details || error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    try {
      const response = await lastValueFrom(this.client.send('VerifyOtp', body));
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

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      return await lastValueFrom(this.client.send('ResetPassword', body));
    } catch (error) {
      throw new HttpException(error.details || error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return { success: true, message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user is set by the JwtStrategy
    return req.user;
  }
}
