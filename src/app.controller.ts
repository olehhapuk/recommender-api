import { Controller, Get, Request } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';

import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { User } from './users/entities/user.entity';
import { Video } from './videos/entities/video.entity';
import { VideosService } from './videos/videos.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly videosService: VideosService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@Request() req): Promise<Video[]> {
    const user: User = req.user;
    const videos = await this.videosService.getFeed(user);
    return videos;
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  async getRecommendations(@Request() req): Promise<Video[]> {
    const user: User = req.user;
    const videos = await this.videosService.getRecommendations(user);
    return videos;
  }

  @Get('popular')
  async getPopular(): Promise<Video[]> {
    const videos = await this.videosService.getPopular();
    return videos;
  }
}
