import { Body, Controller, Post, UseGuards, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

@Controller('media')
export class MediaController implements OnModuleInit {
  private mediaService: any;

  constructor(@Inject('MEDIA_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.mediaService = this.client.getService('MediaService');
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload-url')
  async getUploadUrl(@Body() body: { filename: string; contentType: string; fileSize: number }) {
    const result = await firstValueFrom(this.mediaService.getUploadUrl(body));
    return result;
  }
}
