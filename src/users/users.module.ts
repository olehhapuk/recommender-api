import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { VideosService } from '../videos/videos.service';
import { Video } from '../videos/entities/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Video])],
  controllers: [UsersController],
  providers: [UsersService, VideosService],
})
export class UsersModule {}
