import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { lastValueFrom } from 'rxjs';
import { EmailService } from './email.service';

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
    private readonly emailService: EmailService,
    @Inject('USER_SERVICE') private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
  }

  async register(data: any) {
    const email = data.email;
    const password = data.password;
    const role = data.role;
    const firstName = data.firstName || data.firstname;
    const lastName = data.lastName || data.lastname;

    const userExists = await this.prisma.userCredentials.findUnique({
      where: { email },
    });

    if (userExists && userExists.isVerified) {
      return { success: false, message: 'User already exists', userId: '' };
    }

    const normalizedRole = (role || 'STUDENT').toString().toUpperCase();
    const passwordHash = await bcrypt.hash(password, 10);
    
    let user = userExists;
    if (!user) {
      user = await this.prisma.userCredentials.create({
        data: { email, passwordHash, role: normalizedRole, isVerified: false },
      });

      // Create profile in user-service with actual name and email from registration
      try {
        await lastValueFrom(
          this.userService.UpdateProfile({
            userId: user.id,
            email,
            firstName,
            lastName,
            role: normalizedRole,
          })
        );
      } catch (e) {
        console.error('Failed to create profile in user-service', e);
      }
    } else {
      // If user exists but not verified, update password hash
      user = await this.prisma.userCredentials.update({
        where: { email },
        data: { passwordHash }
      });
    }

    // Generate and store OTP
    const otpCode = this.generateOtp();
    await this.prisma.otpCode.create({
      data: {
        email,
        code: otpCode,
        type: 'REGISTER',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    // Send Email
    await this.emailService.sendOtpEmail(email, otpCode, 'REGISTER');

    return { success: true, message: 'OTP sent to email', userId: user.id };
  }

  async verifyOtp(data: any) {
    const { email, code, type } = data;
    
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { email, code, type },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return { success: false, message: 'Invalid OTP', token: '', refreshToken: '' };
    }

    if (otpRecord.expiresAt < new Date()) {
      return { success: false, message: 'OTP has expired', token: '', refreshToken: '' };
    }

    // Mark as verified if it's registration
    if (type === 'REGISTER') {
      const user = await this.prisma.userCredentials.update({
        where: { email },
        data: { isVerified: true }
      });

      // We can also generate and return a token here directly so they are logged in
      const tokens = await this.generateTokens(user);
      
      // Cleanup used OTPs
      await this.prisma.otpCode.deleteMany({ where: { email, type: 'REGISTER' } });

      return { success: true, message: 'Account verified successfully', token: tokens.token, refreshToken: tokens.refreshToken };
    }

    return { success: true, message: 'OTP verified', token: '', refreshToken: '' };
  }

  async forgotPassword(data: any) {
    const { email } = data;
    const user = await this.prisma.userCredentials.findUnique({ where: { email } });
    
    // For security, always return success even if user not found to prevent enumeration
    if (user && user.isVerified) {
      const otpCode = this.generateOtp();
      await this.prisma.otpCode.create({
        data: {
          email,
          code: otpCode,
          type: 'RESET_PASSWORD',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      });
      await this.emailService.sendOtpEmail(email, otpCode, 'RESET_PASSWORD');
    }

    return { success: true, message: 'If the email exists, an OTP has been sent.' };
  }

  async resetPassword(data: any) {
    const email = data.email;
    const code = data.code;
    const newPassword = data.newPassword || data.newpassword;

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { email, code, type: 'RESET_PASSWORD' },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.userCredentials.update({
      where: { email },
      data: { passwordHash }
    });

    await this.prisma.otpCode.deleteMany({ where: { email, type: 'RESET_PASSWORD' } });

    return { success: true, message: 'Password reset successful' };
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
    
    if (!user.isVerified) {
      return { success: false, token: '', refreshToken: '', message: 'Please verify your email first' };
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

    if (!user || !user.hashedRefreshToken || !user.isVerified) {
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
