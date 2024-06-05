import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) =>
        Promise.resolve({
          id,
          email: 'test@mail.io',
          password: 'pass123',
        } as User),
      find: (email: string) =>
        Promise.resolve([
          {
            id: 1,
            password: 'pass123',
            email,
          } as User,
        ]),
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      // signin: () => {},
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@mail.io');
    expect(users.length).toBe(1);
    expect(users[0].email).toBe('test@mail.io');
  });

  it('findUsers returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user.email).toBeDefined();
  });

  it('findUsers throws an error if user with given id is not found', (done) => {
    fakeUsersService.findOne = () => null;
    controller.findUser('1').catch(() => done());
  });
});
