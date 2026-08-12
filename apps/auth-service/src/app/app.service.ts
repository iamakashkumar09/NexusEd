import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { lastValueFrom } from 'rxjs';

interface UserService {
  GetProfile(data: { userId: string }): any;
  UpdateProfile(data: { userId: string; email: string; firstName: string; lastName: string; role: string }): any;
}

@Injectable()
export class AppService implements OnModuleInit {
  private userService: UserService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  async register(data: any) {
    const { email, password, role, firstName = '', lastName = '' } = data;
    const userExists = await this.prisma.userCredentials.findUnique({
      where: { email },
    });

    if (userExists) {
      return { success: false, message: 'User already exists', userId: '' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.userCredentials.create({
      data: { email, passwordHash, role: role || 'student' },
    });

    // Create profile in user-service with actual name and email from registration
    try {
      await lastValueFrom(
        this.userService.UpdateProfile({
          userId: user.id,
          email,
          firstName,
          lastName,
          role: user.role,
        })
      );
    } catch (e) {
      console.error('Failed to create profile in user-service', e);
    }

    return { success: true, message: 'User registered successfully', userId: user.id };
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, { 
      secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
      expiresIn: '7d' 
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.userCredentials.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    return { token, refreshToken };
  }

  async login(data: any) {
    const { email, password } = data;
    const user = await this.prisma.userCredentials.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, token: '', refreshToken: '', message: 'Invalid credentials' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, token: '', refreshToken: '', message: 'Invalid credentials' };
    }

    const tokens = await this.generateTokens(user);

    return { success: true, token: tokens.token, refreshToken: tokens.refreshToken, message: 'Login successful' };
  }

  async refreshToken(data: { userId: string, refreshToken: string }) {
    const user = await this.prisma.userCredentials.findUnique({
      where: { id: data.userId },
    });

    if (!user || !user.hashedRefreshToken) {
      return { success: false, token: '', refreshToken: '', message: 'Access Denied' };
    }

    const isRefreshTokenValid = await bcrypt.compare(data.refreshToken, user.hashedRefreshToken);
    if (!isRefreshTokenValid) {
      return { success: false, token: '', refreshToken: '', message: 'Access Denied' };
    }

    const tokens = await this.generateTokens(user);
    return { success: true, token: tokens.token, refreshToken: tokens.refreshToken, message: 'Token refreshed' };
  }
}
