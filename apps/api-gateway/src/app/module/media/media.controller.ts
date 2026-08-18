import { Body, Controller, Post, UseGuards, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

@Controller('media')
export class MediaController {
  

  constructor(@Inject('MEDIA_SERVICE') private client: ClientProxy) {}

  

  @UseGuards(AuthGuard('jwt'))
  @Post('upload-url')
  async getUploadUrl(@Body() body: { filename: string; contentType: string; fileSize: number }) {
    const result = await firstValueFrom(this.client.send('getUploadUrl', body));
    return result;
  }
}
