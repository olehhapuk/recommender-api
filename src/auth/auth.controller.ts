import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  ForbiddenException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  async register(@Body() data: CreateUserDto): Promise<User> {
    const existingUser = await this.usersService.findOneByUsername(
      data.username,
    );
    if (existingUser) {
      throw new ForbiddenException('Username already taken');
    }

    const user = await this.usersService.create(data);
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    return {
      user: req.user,
      accessToken: this.authService.generateJwt(req.user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    return {
      user: req.user,
      accessToken: this.authService.generateJwt(req.user),
    };
  }
}
