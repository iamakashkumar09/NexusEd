import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

function mapCourse(c: any) {
  if (!c) return c;
  return {
    ...c,
    subtitle: c.subtitle || '',
    category: c.category || '',
    level: c.level || '',
    language: c.language || '',
    description: c.description || '',
    thumbnailUrl: c.thumbnailUrl || '',
    price: c.price || 0,
    sections: c.sections?.map((s: any) => ({
      ...s,
      lectures: s.lectures?.map((l: any) => ({
        ...l,
        videoUrl: l.videoUrl || '',
        videoDuration: l.videoDuration || 0
      }))
    }))
  };
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(data: { instructorId: string; title: string; subtitle?: string; category?: string; level?: string; language?: string; description?: string; thumbnailUrl?: string; price?: number; status?: string; sections?: any[] }) {
    try {
      console.log('Attempting to create course with data:', data);
      const result = await this.prisma.course.create({
        data: {
          instructorId: data.instructorId,
          title: data.title,
          subtitle: data.subtitle,
          category: data.category,
          level: data.level,
          language: data.language,
          description: data.description,
          thumbnailUrl: data.thumbnailUrl,
          price: data.price || 0.0,
          status: data.status || 'DRAFT',
          sections: data.sections && data.sections.length > 0 ? {
            create: data.sections.map(section => ({
              title: section.title,
              order: section.order,
              lectures: section.lectures && section.lectures.length > 0 ? {
                create: section.lectures.map((lecture: any) => ({
                  title: lecture.title,
                  videoUrl: lecture.videoUrl,
                  videoDuration: lecture.videoDuration,
                  order: lecture.order
                }))
              } : undefined
            }))
          } : undefined
        },
      });
      console.log('Successfully created course:', result.id);
      return mapCourse(result);
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(data: { id: string; instructorId: string; title?: string; subtitle?: string; category?: string; level?: string; language?: string; description?: string; thumbnailUrl?: string; price?: number; status?: string }) {
    const course = await this.prisma.course.findUnique({ where: { id: data.id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== data.instructorId) throw new Error('Unauthorized');

    const updated = await this.prisma.course.update({
      where: { id: data.id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        category: data.category,
        level: data.level,
        language: data.language,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        price: data.price,
        status: data.status,
      },
    });
    return mapCourse(updated);
  }

  async getInstructorCourses(instructorId: string) {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          include: {
            lectures: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    return courses.map(mapCourse);
  }

  async getCatalogCourses() {
    const courses = await this.prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          include: {
            lectures: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    return courses.map(mapCourse);
  }

  async getCourse(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            lectures: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    if (!course) throw new NotFoundException('Course not found');
    return mapCourse(course);
  }

  // Section logic
  async createSection(data: { courseId: string; instructorId: string; title: string; order: number }) {
    // Validate course ownership
    const course = await this.prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course || course.instructorId !== data.instructorId) throw new Error('Unauthorized or Course not found');

    return this.prisma.section.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        order: data.order,
      }
    });
  }

  async updateSection(data: { id: string; instructorId: string; title?: string; order?: number }) {
    const section = await this.prisma.section.findUnique({ where: { id: data.id }, include: { course: true } });
    if (!section || section.course.instructorId !== data.instructorId) throw new Error('Unauthorized or Section not found');

    return this.prisma.section.update({
      where: { id: data.id },
      data: {
        title: data.title,
        order: data.order,
      }
    });
  }

  // Lecture logic
  async createLecture(data: { sectionId: string; instructorId: string; title: string; videoUrl?: string; videoDuration?: number; order: number }) {
    const section = await this.prisma.section.findUnique({ where: { id: data.sectionId }, include: { course: true } });
    if (!section || section.course.instructorId !== data.instructorId) throw new Error('Unauthorized or Section not found');

    return this.prisma.lecture.create({
      data: {
        sectionId: data.sectionId,
        title: data.title,
        videoUrl: data.videoUrl,
        videoDuration: data.videoDuration,
        order: data.order,
      }
    });
  }

  async updateLecture(data: { id: string; instructorId: string; title?: string; videoUrl?: string; videoDuration?: number; order?: number }) {
    const lecture = await this.prisma.lecture.findUnique({ where: { id: data.id }, include: { section: { include: { course: true } } } });
    if (!lecture || lecture.section.course.instructorId !== data.instructorId) throw new Error('Unauthorized or Lecture not found');

    return this.prisma.lecture.update({
      where: { id: data.id },
      data: {
        title: data.title,
        videoUrl: data.videoUrl,
        videoDuration: data.videoDuration,
        order: data.order,
      }
    });
  }

  // Student Actions
  async enrollCourse(data: { userId: string; courseId: string }) {
    const course = await this.prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: data.userId, courseId: data.courseId } }
    });

    if (existingEnrollment) {
      return { success: true, message: 'Already enrolled' };
    }

    await this.prisma.enrollment.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        progress: 0
      }
    });

    return { success: true, message: 'Successfully enrolled' };
  }

  async getStudentCourses(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            sections: {
              include: { lectures: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return enrollments.map(e => ({
      ...mapCourse(e.course),
      progress: e.progress
    }));
  }

  async updateLectureProgress(data: { userId: string; courseId: string; lectureId: string; completed: boolean }) {
    await this.prisma.lectureProgress.upsert({
      where: { userId_lectureId: { userId: data.userId, lectureId: data.lectureId } },
      update: { completed: data.completed, courseId: data.courseId },
      create: {
        userId: data.userId,
        courseId: data.courseId,
        lectureId: data.lectureId,
        completed: data.completed
      }
    });

    return this.getCourseProgress({ userId: data.userId, courseId: data.courseId });
  }

  async getCourseProgress(data: { userId: string; courseId: string }) {
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
      include: { sections: { include: { lectures: true } } }
    });

    if (!course) throw new NotFoundException('Course not found');

    let totalLectures = 0;
    course.sections.forEach(s => totalLectures += s.lectures.length);

    const completedProgresses = await this.prisma.lectureProgress.findMany({
      where: {
        userId: data.userId,
        courseId: data.courseId,
        completed: true
      }
    });

    const completedCount = completedProgresses.length;
    const progress = totalLectures > 0 ? (completedCount / totalLectures) * 100 : 0;

    await this.prisma.enrollment.updateMany({
      where: { userId: data.userId, courseId: data.courseId },
      data: { progress }
    });

    return {
      progress,
      completedLectureIds: completedProgresses.map(p => p.lectureId)
    };
  }

  async getStudentStats(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            sections: {
              include: { lectures: true }
            }
          }
        }
      }
    });

    let hoursLearned = 0;
    let certificates = 0;

    const completedProgresses = await this.prisma.lectureProgress.findMany({
      where: { userId, completed: true }
    });
    
    // Create a set of completed lecture IDs for fast lookup
    const completedSet = new Set(completedProgresses.map(p => p.lectureId));

    for (const enrollment of enrollments) {
      if (enrollment.progress === 100) certificates++;

      for (const section of enrollment.course.sections) {
        for (const lecture of section.lectures) {
          if (completedSet.has(lecture.id) && lecture.videoDuration) {
            hoursLearned += lecture.videoDuration; // assuming videoDuration is in seconds
          }
        }
      }
    }

    return {
      coursesEnrolled: enrollments.length,
      hoursLearned: Math.round(hoursLearned / 3600),
      dayStreak: 7, // Mocked for now
      certificates,
    };
  }
}
