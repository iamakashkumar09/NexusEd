import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('CourseService', 'CreateCourse')
  async createCourse(data: any) {
    const course = await this.appService.createCourse(data);
    return course;
  }

  @GrpcMethod('CourseService', 'UpdateCourse')
  async updateCourse(data: any) {
    const course = await this.appService.updateCourse(data);
    return course;
  }

  @GrpcMethod('CourseService', 'GetCourse')
  async getCourse(data: { id: string }) {
    const course = await this.appService.getCourse(data.id);
    return course;
  }

  @GrpcMethod('CourseService', 'GetInstructorCourses')
  async getInstructorCourses(data: { instructorId: string }) {
    const instructorId = data.instructorId || (data as any).instructorid;
    const courses = await this.appService.getInstructorCourses(instructorId);
    return { courses };
  }

  @GrpcMethod('CourseService', 'GetCatalogCourses')
  async getCatalogCourses() {
    const courses = await this.appService.getCatalogCourses();
    return { courses };
  }

  @GrpcMethod('CourseService', 'CreateSection')
  async createSection(data: any) {
    const section = await this.appService.createSection(data);
    return section;
  }

  @GrpcMethod('CourseService', 'UpdateSection')
  async updateSection(data: any) {
    const section = await this.appService.updateSection(data);
    return section;
  }

  @GrpcMethod('CourseService', 'CreateLecture')
  async createLecture(data: any) {
    const lecture = await this.appService.createLecture(data);
    return lecture;
  }

  @GrpcMethod('CourseService', 'UpdateLecture')
  async updateLecture(data: any) {
    const lecture = await this.appService.updateLecture(data);
    return lecture;
  }

  @GrpcMethod('CourseService', 'EnrollCourse')
  async enrollCourse(data: { userId: string; courseId: string }) {
    const userId = data.userId || (data as any).userid;
    const courseId = data.courseId || (data as any).courseid;
    return this.appService.enrollCourse({ ...data, userId, courseId });
  }

  @GrpcMethod('CourseService', 'GetStudentCourses')
  async getStudentCourses(data: { userId: string }) {
    console.log('GetStudentCourses called with data:', data);
    const userId = data.userId || (data as any).userid;
    const courses = await this.appService.getStudentCourses(userId);
    return { courses };
  }

  @GrpcMethod('CourseService', 'UpdateLectureProgress')
  async updateLectureProgress(data: { userId: string; courseId: string; lectureId: string; completed: boolean }) {
    const userId = data.userId || (data as any).userid;
    const courseId = data.courseId || (data as any).courseid;
    const lectureId = data.lectureId || (data as any).lectureid;
    return this.appService.updateLectureProgress({ ...data, userId, courseId, lectureId });
  }

  @GrpcMethod('CourseService', 'GetCourseProgress')
  async getCourseProgress(data: { userId: string; courseId: string }) {
    const userId = data.userId || (data as any).userid;
    const courseId = data.courseId || (data as any).courseid;
    return this.appService.getCourseProgress({ ...data, userId, courseId });
  }

  @GrpcMethod('CourseService', 'GetStudentStats')
  async getStudentStats(data: { userId: string }) {
    const userId = data.userId || (data as any).userid;
    return this.appService.getStudentStats(userId);
  }
}
