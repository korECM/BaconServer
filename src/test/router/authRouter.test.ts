import request from 'supertest';
import { app } from '../../index';
import { SignUpInterface, SignInInterface } from '../../service/UserService';
import faker from 'faker/locale/ko';
describe('POST /auth/signUp', () => {
  it('invalid form이 전달되면 400을 반환한다', async () => {
    // Arrange
    const invalidForm: SignUpInterface[] = [
      {
        name: '',
        provider: 'local',
        email: faker.internet.email(),
        password: faker.internet.password(),
        snsId: '',
      },
      {
        name: faker.name.findName(),
        provider: 'local',
        email: '',
        password: faker.internet.password(),
        snsId: '',
      },
      {
        name: faker.name.findName(),
        provider: 'local',
        email: faker.internet.email(),
        password: '',
        snsId: '',
      },
      {
        name: faker.name.findName(),
        provider: 'local',
        email: 'It is not email',
        password: faker.internet.password(),
        snsId: '',
      },
      {
        name: faker.name.findName(),
        provider: 'invalid',
        email: faker.internet.email(),
        password: faker.internet.password(),
        snsId: '',
      },
    ];

    //Act, Assert
    for (let form of invalidForm) await request(app).post('/auth/signUp').send(form).expect(400);
  });
});

describe('POST /auth/signIn', () => {
  it('invalid form이 전달되면 400을 반환한다 ', async () => {
    // Arrange
    const invalidForm: SignInInterface[] = [
      {
        email: '',
        password: faker.internet.password(),
      },
      {
        email: faker.internet.email(),
        password: '',
      },
      {
        email: 'It is not email',
        password: faker.internet.password(),
      },
    ];

    //Act, Assert
    for (let form of invalidForm) await request(app).post('/auth/signIn').send(form).expect(400);
  });
});
