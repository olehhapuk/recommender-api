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

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
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
      dest: './uploads',
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return {
      videoName: file.filename,
      thumbnailUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.rootela.com%2Fwp-content%2Fuploads%2F2019%2F02%2Ftik-tok-musical-thumbnail.jpg&f=1&nofb=1&ipt=d166a8963ce8d6382dc022ac5bccc885bcf63e959ffb56330e2ecd128dca10d5&ipo=images',
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
