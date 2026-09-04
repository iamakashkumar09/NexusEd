import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import * as crypto from 'crypto';

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitService.name);
  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/';
  private readonly VIDEO_UPLOADED_QUEUE = 'video.uploaded';

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.VIDEO_UPLOADED_QUEUE, { durable: true });
      this.logger.log('Connected to RabbitMQ and asserted queue: ' + this.VIDEO_UPLOADED_QUEUE);
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      setTimeout(() => this.connect(), 5000); // retry
    }
  }

  async publishVideoUploaded(courseId: string, lectureId: string, videoUrl: string) {
    if (!this.channel) {
      this.logger.warn('RabbitMQ channel not ready, message not sent');
      return;
    }
    
    const payload = {
      eventType: 'VideoUploaded',
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      courseId,
      lectureId,
      videoUrl,
    };

    const sent = this.channel.sendToQueue(
      this.VIDEO_UPLOADED_QUEUE,
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,
        contentType: 'application/json',
      }
    );

    if (sent) {
      this.logger.log(`Published video.uploaded event for lecture ${lectureId}`);
    } else {
      this.logger.error(`Failed to publish video.uploaded event for lecture ${lectureId}`);
    }
  }
}
