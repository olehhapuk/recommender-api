import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
  NotFoundException,
  Request,
  UseGuards,
  Query,
  Response,
} from '@nestjs/common';
import { Response as Res } from 'express';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { VideosService } from '../videos/videos.service';
import { Video } from '../videos/entities/video.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly videosService: VideosService,
  ) {}

  @Post()
  async create(@Body() data: CreateUserDto): Promise<User> {
    const existingUser = await this.usersService.findOneByUsername(
      data.username,
    );
    if (existingUser) {
      throw new ForbiddenException('Username already taken');
    }

    return this.usersService.create(data);
  }

  @Get()
  async findAll(
    @Query('query') query = '',
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Response() res: Res,
  ) {
    const { users, count } = await this.usersService.findAll(
      query.trim().toLowerCase(),
      +page,
      +limit,
    );
    res.set('total-count', count.toString()).json(users);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    const user = this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    const existingUser = await this.usersService.findOne(+id);
    if (!existingUser) {
      throw new NotFoundException();
    }

    return this.usersService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const existingUser = await this.usersService.findOne(+id);
    if (!existingUser) {
      throw new NotFoundException();
    }

    return this.usersService.remove(+id);
  }

  @Get(':id/uploads')
  async getUploads(@Param('id') id: string): Promise<Video[]> {
    const author = await this.usersService.findOne(+id);
    if (!author) {
      throw new NotFoundException();
    }

    return this.videosService.findByAuthor(author.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(@Param('id') id: string, @Request() req): Promise<User> {
    const authUser: User = req.user;

    if (authUser.id === +id) {
      throw new ForbiddenException();
    }

    const userToFollow = await this.usersService.findOne(+id);

    if (!userToFollow) {
      throw new NotFoundException();
    }

    const isFollowing = await this.usersService.checkFollow(
      authUser,
      userToFollow,
    );
    if (isFollowing) {
      throw new ForbiddenException();
    }

    const followedUser = await this.usersService.follow(authUser, userToFollow);
    return followedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unfollow')
  async unfollow(@Param('id') id: string, @Request() req): Promise<User> {
    const authUser: User = req.user;

    if (authUser.id === +id) {
      throw new ForbiddenException();
    }

    const userToFollow = await this.usersService.findOne(+id);

    if (!userToFollow) {
      throw new NotFoundException();
    }

    const isFollowing = await this.usersService.checkFollow(
      authUser,
      userToFollow,
    );
    if (!isFollowing) {
      throw new ForbiddenException();
    }

    const followedUser = await this.usersService.unfollow(
      authUser,
      userToFollow,
    );
    return followedUser;
  }
}
