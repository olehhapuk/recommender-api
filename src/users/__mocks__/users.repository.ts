import { User } from '../entities/user.entity';

export const usersRepositoryMock = {
  users: [],
  save: jest.fn((data): User => {
    const user: User = {
      id: 1,
      username: data.username,
      password: data.password,
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

    usersRepositoryMock.users.push(user);
    return user;
  }),
  findOneBy: jest.fn((where) => {
    return usersRepositoryMock.users.find(
      (user) => user.id === where.id || user.username === where.username,
    );
  }),
};
