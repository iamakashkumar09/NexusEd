import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('CreateCourse')
  async createCourse(data: any) {
    const course = await this.appService.createCourse(data);
    return course;
  }

  @MessagePattern('UpdateCourse')
  async updateCourse(data: any) {
    const course = await this.appService.updateCourse(data);
    return course;
  }

  @MessagePattern('GetCourse')
  async getCourse(data: { id: string }) {
    const course = await this.appService.getCourse(data.id);
    return course;
  }

  @MessagePattern('GetInstructorCourses')
  async getInstructorCourses(data: { instructorId: string }) {
    const instructorId = data.instructorId || (data as any).instructorid;
    const courses = await this.appService.getInstructorCourses(instructorId);
    return { courses };
  }

  @MessagePattern('GetCatalogCourses')
  async getCatalogCourses() {
    const courses = await this.appService.getCatalogCourses();
    return { courses };
  }

  @MessagePattern('CreateSection')
  async createSection(data: any) {
    const section = await this.appService.createSection(data);
    return section;
  }

  @MessagePattern('UpdateSection')
  async updateSection(data: any) {
    const section = await this.appService.updateSection(data);
    return section;
  }

  @MessagePattern('CreateLecture')
  async createLecture(data: any) {
    const lecture = await this.appService.createLecture(data);
    return lecture;
  }

  @MessagePattern('UpdateLecture')
  async updateLecture(data: any) {
    const lecture = await this.appService.updateLecture(data);
    return lecture;
  }

  @MessagePattern('EnrollCourse')
  async enrollCourse(data: { userId: string; courseId: string }) {
    const userId = data.userId || (data as any).userid;
    const courseId = data.courseId || (data as any).courseid;
    return this.appService.enrollCourse({ ...data, userId, courseId });
  }

  @MessagePattern('GetStudentCourses')
  async getStudentCourses(data: { userId: string }) {
    console.log('GetStudentCourses called with data:', data);
    const userId = data.userId || (data as any).userid;
    const courses = await this.appService.getStudentCourses(userId);
    return { courses };
  }

  @MessagePattern('UpdateLectureProgress')
  async updateLectureProgress(data: { userId: string; courseId: string; lectureId: string; completed: boolean }) {
    const userId = data.userId || (data as any).userid;
    const courseId = data.courseId || (data as any).courseid;
    const lectureId = data.lectureId || (data as any).lectureid;
    return this.appService.updateLectureProgress({ ...data, userId, courseId, lectureId });
  }

  @MessagePattern('GetCourseProgress')
  async getCourseProgress(data: { userId: string; courseId: string }) {
    const userId = data.userId || (data as any).userid;
    const courseId = data.courseId || (data as any).courseid;
    return this.appService.getCourseProgress({ ...data, userId, courseId });
  }

  @MessagePattern('GetStudentStats')
  async getStudentStats(data: { userId: string }) {
    const userId = data.userId || (data as any).userid;
    return this.appService.getStudentStats(userId);
  }
}
