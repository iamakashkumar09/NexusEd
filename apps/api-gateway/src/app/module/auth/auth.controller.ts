import { Controller, Post, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

interface AuthService {
  Register(data: any): any;
  Login(data: any): any;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  @Post('register')
  async register(@Body() body: any) {
    return await lastValueFrom(this.authService.Register(body));
  }

  @Post('login')
  async login(@Body() body: any) {
    return await lastValueFrom(this.authService.Login(body));
  }
}
