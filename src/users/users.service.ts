import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Like, Repository } from 'typeorm';
import * as gravatar from 'gravatar';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  defaultRelations: FindOptionsRelations<User> = {
    followers: true,
    following: true,
    recommendedTags: true,
  };

  async create(data: CreateUserDto): Promise<User> {
    const newUser = await this.usersRepository.save({
      username: data.username,
      email: data.email,
      password: data.password,
      avatarUrl: gravatar.url(data.email),
    });

    return newUser;
  }

  async findAll(
    query: string,
    page = 1,
    limit = 12,
  ): Promise<{ users: User[]; count: number }> {
    if (query !== '') {
      const [users, count] = await this.usersRepository.findAndCount({
        relations: this.defaultRelations,
        where: {
          username: Like(`%${query}%`),
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { users, count };
    } else {
      const [users, count] = await this.usersRepository.findAndCount({
        relations: this.defaultRelations,
        skip: (page - 1) * limit,
        take: limit,
      });
      return { users, count };
    }
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        id,
      },
      relations: this.defaultRelations,
    });
  }

  findOneByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        username,
      },
      relations: this.defaultRelations,
    });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email,
      },
      relations: this.defaultRelations,
    });
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    user.username = data.username;
    user.password = data.password;
    user.avatarUrl = data.avatarUrl;
    user.description = data.description;

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async checkFollow(userA: User, userB: User): Promise<boolean> {
    return !!userA.following.find((user) => user.id === userB.id);
  }

  async follow(authUser: User, userToFollow: User): Promise<User> {
    userToFollow.followers.push(authUser);
    await this.usersRepository.save(userToFollow);
    return this.usersRepository.findOne({
      where: {
        id: userToFollow.id,
      },
      relations: this.defaultRelations,
    });
  }

  async unfollow(authUser: User, userToUnfollow: User): Promise<User> {
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (user) => user.id !== authUser.id,
    );
    await this.usersRepository.save(userToUnfollow);
    return this.usersRepository.findOne({
      where: {
        id: userToUnfollow.id,
      },
      relations: this.defaultRelations,
    });
  }

  async saveRecommendedTags(user: User, tags: Tag[]): Promise<User> {
    for (const tag of tags) {
      const tagExists = user.recommendedTags.find(({ id }) => id === tag.id);
      if (!tagExists) {
        user.recommendedTags.push(tag);
      }
    }

    while (user.recommendedTags.length > 10) {
      user.recommendedTags.shift();
    }

    await this.usersRepository.save(user);

    return this.findOne(user.id);
  }
}
