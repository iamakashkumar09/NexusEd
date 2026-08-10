import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { lastValueFrom } from 'rxjs';

interface UserService {
  GetProfile(data: { userId: string }): any;
  UpdateProfile(data: { userId: string; firstName: string; lastName: string }): any;
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
    const { email, password, role } = data;
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

    // Make synchronous gRPC call to user-service to create the profile
    // Note: Since user-service is not yet fully implemented, this might fail, but it's the intended architecture
    try {
      await lastValueFrom(
        this.userService.UpdateProfile({
          userId: user.id,
          firstName: '',
          lastName: '',
        })
      );
    } catch (e) {
      console.error('Failed to create profile in user-service', e);
    }

    return { success: true, message: 'User registered successfully', userId: user.id };
  }

  async login(data: any) {
    const { email, password } = data;
    const user = await this.prisma.userCredentials.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, token: '', message: 'Invalid credentials' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, token: '', message: 'Invalid credentials' };
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return { success: true, token, message: 'Login successful' };
  }
}
