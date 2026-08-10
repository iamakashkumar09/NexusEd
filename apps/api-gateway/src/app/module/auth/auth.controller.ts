import { Controller, Post, Body, Inject, OnModuleInit, UseGuards, Get, Request } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthService {
  Register(data: any): any;
  Login(data: any): any;
  RefreshToken(data: any): any;
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
    return await lastValueFrom(this.authService.Register(body));
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return await lastValueFrom(this.authService.Login(body));
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return await lastValueFrom(this.authService.RefreshToken(body));
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user is set by the JwtStrategy
    return req.user;
  }
}
