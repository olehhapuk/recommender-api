import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user || user.password !== password) {
      return null;
    }

    return user;
  }

  async findUserById(id: number): Promise<User | null> {
    const user = await this.usersService.findOne(id);
    return user || null;
  }

  generateJwt(user: User): string {
    const payload = {
      id: user.id,
    };

    return this.jwtService.sign(payload);
  }
}
