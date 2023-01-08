import { User } from '../entities/user.entity';

export class UsersServiceMock {
  findOneByUsername(username: string): User {
    return {
      id: 1,
      username,
      password: 'pass',
      avatarUrl: '',
      description: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      videos: [],
      followers: [],
      following: [],
      likes: [],
      recommendedTags: [],
    };
  }
}
