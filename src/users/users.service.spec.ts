import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { usersRepositoryMock } from './__mocks__/users.repository';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const defaultUserData: CreateUserDto = {
    username: 'john',
    password: '12345',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create new user', async () => {
    const user = await service.create(defaultUserData);

    expect(user).toBeDefined();
    expect(user).toMatchObject(defaultUserData);
    expect(usersRepositoryMock.save).toBeCalled();
  });

  it('should find user by id', async () => {
    const createdUser = await service.create(defaultUserData);
    const user = await service.findOne(createdUser.id);

    expect(user).toBeDefined();
    expect(user).toMatchObject(defaultUserData);
    expect(usersRepositoryMock.findOneBy).toBeCalled();
  });

  it('should find user by username', async () => {
    const createdUser = await service.create(defaultUserData);
    const user = await service.findOneByUsername(createdUser.username);

    expect(user).toBeDefined();
    expect(user).toMatchObject(defaultUserData);
    expect(usersRepositoryMock.findOneBy).toBeCalled();
  });
});
