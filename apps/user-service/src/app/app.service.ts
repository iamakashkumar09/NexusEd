import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getProfile(data: { userId: string }) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: data.userId },
      include: {
        studentProfile: true,
        instructorProfile: true,
      }
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
      role: profile.role || '',
      
      // Student specific fields
      bio: profile.studentProfile?.bio,
      learningGoals: profile.studentProfile?.learningGoals,
      interests: profile.studentProfile?.interests,

      // Instructor specific fields
      headline: profile.instructorProfile?.headline,
      biography: profile.instructorProfile?.biography,
      website: profile.instructorProfile?.website,
      socialLinks: profile.instructorProfile?.socialLinks,
    };
  }

  async updateProfile(data: { 
    userId: string; 
    email?: string;
    firstName: string; 
    lastName: string; 
    role?: string;
    bio?: string;
    learningGoals?: string;
    interests?: string;
    headline?: string;
    biography?: string;
    website?: string;
    socialLinks?: string;
  }) {
    try {
      const existing = await this.prisma.userProfile.findUnique({ where: { userId: data.userId } });
      const userRole = (data.role || existing?.role || 'STUDENT').toString().toUpperCase();

      await this.prisma.userProfile.upsert({
        where: { userId: data.userId },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          ...(data.email ? { email: data.email } : {}),
          role: userRole,
          ...(userRole === 'STUDENT' || userRole === 'student' ? {
            studentProfile: {
              upsert: {
                create: {
                  bio: data.bio,
                  learningGoals: data.learningGoals,
                  interests: data.interests
                },
                update: {
                  bio: data.bio,
                  learningGoals: data.learningGoals,
                  interests: data.interests
                }
              }
            }
          } : {}),
          ...(userRole === 'INSTRUCTOR' || userRole === 'instructor' ? {
            instructorProfile: {
              upsert: {
                create: {
                  headline: data.headline,
                  biography: data.biography,
                  website: data.website,
                  socialLinks: data.socialLinks
                },
                update: {
                  headline: data.headline,
                  biography: data.biography,
                  website: data.website,
                  socialLinks: data.socialLinks
                }
              }
            }
          } : {})
        },
        create: {
          userId: data.userId,
          firstName: data.firstName || 'Unknown',
          lastName: data.lastName || 'User',
          email: data.email || '',
          role: userRole,
          studentProfile: (userRole === 'STUDENT' || userRole === 'student') ? { 
            create: {
              bio: data.bio,
              learningGoals: data.learningGoals,
              interests: data.interests
            } 
          } : undefined,
          instructorProfile: (userRole === 'INSTRUCTOR' || userRole === 'instructor') ? { 
            create: {
              headline: data.headline,
              biography: data.biography,
              website: data.website,
              socialLinks: data.socialLinks
            } 
          } : undefined,
        },
      });

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Failed to update profile', error);
      return { success: false, message: 'Failed to update profile' };
    }
  }
}
