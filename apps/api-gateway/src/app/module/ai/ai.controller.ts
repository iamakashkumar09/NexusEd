import {
  Body,
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Inject,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class QueryCourseDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  lectureId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Controller
// Proxies AI query requests from the frontend → GenAI Service via gRPC
// ─────────────────────────────────────────────────────────────────────────────

@Controller('ai')
export class AiController implements OnModuleInit {
  private aiService: any;

  constructor(@Inject('AI_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.aiService = this.client.getService('AIService');
  }

  /**
   * POST /api/ai/courses/:courseId/query
   * Student asks a question about a course — answered by the RAG pipeline.
   */
  @Post('courses/:courseId/query')
  async queryCourse(
    @Req() req: any,
    @Param('courseId') courseId: string,
    @Body() body: QueryCourseDto,
  ) {
    if (!body.question || !body.question.trim()) {
      throw new HttpException(
        'Question cannot be empty.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result: any = await firstValueFrom(
        this.aiService.QueryCourse({
          courseId,
          question: body.question.trim(),
          lectureId: body.lectureId ?? '',
        }),
      );
      return {
        answer: result.answer,
        sources: result.sources,
        courseId,
        lectureId: body.lectureId ?? null,
      };
    } catch (err) {
      throw new HttpException(
        'AI service is unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
