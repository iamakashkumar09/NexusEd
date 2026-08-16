import { Controller, Get, Query, Res } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller('media')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // =================== HTTP OAuth Routes ===================
  @Get('auth')
  authenticate(@Res() res: Response) {
    const url = this.appService.getAuthUrl();
    res.redirect(url);
  }

  @Get('oauth2callback')
  async oauthCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('No code provided');
    }
    
    await this.appService.handleCallback(code);
    return res.send('Successfully authenticated with YouTube! You can close this window and check the console logs for your YOUTUBE_REFRESH_TOKEN.');
  }

  // =================== gRPC Routes ===================
  @GrpcMethod('MediaService', 'GetUploadUrl')
  async getUploadUrl(data: { filename: string; contentType: string; fileSize: number }) {
    try {
      const result = await this.appService.getUploadUrl(data);
      return result;
    } catch (error: any) {
      // Return a structured error if auth fails
      return { uploadUrl: '', mediaId: 'error: ' + error.message };
    }
  }
}
