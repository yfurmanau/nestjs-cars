import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@mail.io', 'Pass123');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', (done) => {
    service.signup('test@mail.io', 'Pass123').then(() => {
      service.signup('test@mail.io', 'Pass123').catch((err) => {
        expect(err.response.message).toBe('email in use');
        done();
      });
    });
  });

  it('throws if signin is called with an unused email', (done) => {
    service.signin('test@mail.io', 'Pass123').catch((err) => {
      expect(err.response.message).toBe('user not found');
      done();
    });
  });

  it('throws if an invalid password is provided', (done) => {
    service.signup('test@mail.io', 'Pass123').then(() => {
      service.signin('test@mail.io', 'Pass1234').catch((err) => {
        expect(err.response.message).toBe('bad password');
        done();
      });
    });
  });

  it('returns a user if corrected password is provided', async () => {
    await service.signup('test@mail.io', 'Pass123');
    const user = await service.signin('test@mail.io', 'Pass123');
    expect(user).toBeDefined();
  });
});
