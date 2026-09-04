import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      'http://localhost:5003/api/media/oauth2callback' // Direct media-service redirect URI
    );
    
    // If we already have a refresh token saved in .env, set it!
    if (process.env.YOUTUBE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      });
    }
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
      prompt: 'consent' // Forces refresh token generation
    });
  }

  async handleCallback(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    this.logger.log('YouTube Tokens generated! Please save this refresh_token in media-service .env as YOUTUBE_REFRESH_TOKEN:');
    this.logger.log(tokens.refresh_token);
    return tokens;
  }

  async getUploadUrl(data: { filename: string; contentType: string; fileSize: number }) {
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
      throw new Error('YouTube is not authenticated. Please visit /api/media/auth first.');
    }

    const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

    // We only create a "draft" unlisted video container
    const res = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: data.filename,
          description: 'Uploaded via NexusEd Platform',
        },
        status: {
          privacyStatus: 'unlisted', // Hidden from public YouTube search
        },
      },
      media: {
        mimeType: data.contentType || 'video/mp4',
        // In the Node.js googleapis client, to just get a resumable URL without uploading immediately,
        // it's a bit tricky because the SDK tries to upload the whole file. 
        // We will make a raw HTTP request to get the resumable session URL instead.
      },
    }, {
      // We don't use the standard client for this because it doesn't expose the resumable URL easily.
    }).catch(() => null); 
    
    // Instead of using the SDK to upload, we manually request the Resumable Session URL
    const token = await this.oauth2Client.getAccessToken();
    const response = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Length': data.fileSize.toString(),
          'X-Upload-Content-Type': data.contentType || 'video/mp4',
          'Origin': 'http://localhost:3000', // MUST match Authorized JavaScript origins in Google Cloud
        },
        body: JSON.stringify({
          snippet: {
            title: data.filename || 'Untitled Course Video',
            description: 'Uploaded via NexusEd Platform',
          },
          status: {
            privacyStatus: 'unlisted',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate YouTube upload session: ${await response.text()}`);
    }

    // The resumable URL is in the Location header
    const uploadUrl = response.headers.get('Location');
    return { uploadUrl, mediaId: 'youtube-pending' };
  }
}
