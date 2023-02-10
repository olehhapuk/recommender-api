import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Video } from './entities/video.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { TagsService } from '../tags/tags.service';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: CreateVideoDto, @Request() req): Promise<Video> {
    const tags = await this.tagsService.findOrCreate(data.tags);
    return this.videosService.create(data, req.user, tags);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      dest: './public/uploads',
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    const res = await this.cloudinaryService.uploadVideo(file);
    return {
      videoUrl: res.secure_url,
      thumbnailUrl: res.secure_url.replace('.mp4', '.jpg'),
    };
  }

  @Patch(':id/view')
  async recordView(@Param('id') id: string): Promise<Video> {
    const video = await this.videosService.findOne(+id);
    if (!video) {
      throw new NotFoundException();
    }

    return this.videosService.recordView(video);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Param('id') id: string, @Request() req): Promise<Video> {
    const authUser: User = req.user;
    const video = await this.videosService.findOne(+id);
    if (!video) {
      throw new NotFoundException();
    }

    const isLiked = await this.videosService.checkLike(video, authUser);
    if (isLiked) {
      throw new ForbiddenException();
    }

    await this.usersService.saveRecommendedTags(authUser, video.tags);

    return this.videosService.like(video, authUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unlike')
  async unlike(@Param('id') id: string, @Request() req): Promise<Video> {
    const authUser: User = req.user;
    const video = await this.videosService.findOne(+id);
    if (!video) {
      throw new NotFoundException();
    }

    const isLiked = await this.videosService.checkLike(video, authUser);
    if (!isLiked) {
      throw new ForbiddenException();
    }

    return this.videosService.unlike(video, authUser);
  }
}
