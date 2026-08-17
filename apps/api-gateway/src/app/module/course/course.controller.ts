import { Body, Controller, Get, Param, Post, Put, Req, UseGuards, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('courses')
export class CourseController implements OnModuleInit {
  private courseService: any;

  constructor(@Inject('COURSE_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.courseService = this.client.getService('CourseService');
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createCourse(@Req() req: any, @Body() body: any) {
    if (req.user.role !== 'INSTRUCTOR') {
      throw new Error('Forbidden: Only instructors can create courses');
    }
    const result = await firstValueFrom(this.courseService.createCourse({ ...body, instructorId: req.user.userId }));
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateCourse(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'INSTRUCTOR') {
      throw new Error('Forbidden: Only instructors can update courses');
    }
    const result = await firstValueFrom(this.courseService.updateCourse({ ...body, id, instructorId: req.user.userId }));
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('instructor/my-courses')
  async getMyCourses(@Req() req: any) {
    if (req.user.role !== 'INSTRUCTOR') {
      throw new Error('Forbidden: Only instructors can view their courses');
    }
    const result = await firstValueFrom(this.courseService.getInstructorCourses({ instructorId: req.user.userId }));
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('student/my-courses')
  async getStudentCourses(@Req() req: any) {
    const result = await firstValueFrom(this.courseService.getStudentCourses({ userId: req.user.userId }));
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('student/stats')
  async getStudentStats(@Req() req: any) {
    const result = await firstValueFrom(this.courseService.getStudentStats({ userId: req.user.userId }));
    return result;
  }

  @Get('catalog')
  async getCatalogCourses() {
    const result = await firstValueFrom(this.courseService.getCatalogCourses({}));
    return result;
  }

  @Get(':id')
  async getCourse(@Param('id') id: string) {
    const result = await firstValueFrom(this.courseService.getCourse({ id }));
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/enroll')
  async enrollCourse(@Req() req: any, @Param('id') id: string) {
    const result = await firstValueFrom(this.courseService.enrollCourse({ userId: req.user.userId, courseId: id }));
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/progress')
  async updateProgress(@Req() req: any, @Param('id') courseId: string, @Body() body: UpdateProgressDto) {
    const result = await firstValueFrom(this.courseService.updateLectureProgress({ 
      userId: req.user.userId, 
      courseId, 
      lectureId: body.lectureId, 
      completed: body.completed 
    }));
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/progress')
  async getProgress(@Req() req: any, @Param('id') courseId: string) {
    const result = await firstValueFrom(this.courseService.getCourseProgress({ userId: req.user.userId, courseId }));
    return result;
  }
}
