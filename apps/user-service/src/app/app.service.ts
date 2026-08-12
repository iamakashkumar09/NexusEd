import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getProfile(data: { userId: string }) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: data.userId },
    });
    
    if (!profile) {
      return {
        userId: data.userId,
        firstName: '',
        lastName: '',
        email: '',
        role: ''
      };
    }

    return {
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email || '',
      role: profile.role || ''
    };
  }

  async updateProfile(data: { userId: string; firstName: string; lastName: string; role?: string }) {
    try {
      const userRole = data.role || 'student';

      await this.prisma.userProfile.upsert({
        where: { userId: data.userId },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          role: userRole,
        },
        create: {
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: '', // Email might be synced later or not needed
          role: userRole,
          studentProfile: userRole === 'student' ? { create: {} } : undefined,
          instructorProfile: userRole === 'instructor' ? { create: {} } : undefined,
        },
      });

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Failed to update profile', error);
      return { success: false, message: 'Failed to update profile' };
    }
  }
}
