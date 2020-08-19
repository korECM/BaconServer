import request from 'supertest';
import { app } from '../../index';
import { SignUpInterface, SignInInterface } from '../../service/UserService';
import faker from 'faker/locale/ko';
import { invalid } from 'joi';
describe('POST /auth/signUp', () => {
  it('invalid form이 전달되면 400을 반환한다', async () => {
    // Arrange
    const invalidForm: SignUpInterface[] = [
      {
        name: '',
        provider: 'local',
        email: faker.internet.email(),
        gender: 'm',
        password: faker.internet.password(),
        snsId: '',
      },
      {
        name: faker.name.findName(),
        provider: 'local',
        email: '',
        password: faker.internet.password(),
        gender: 'm',
        snsId: '',
      },
      {
        name: faker.name.findName(),
        provider: 'local',
        email: faker.internet.email(),
        gender: 'm',
        password: '',
        snsId: '',
      },
      {
        name: faker.name.findName(),
        provider: 'local',
        email: 'It is not email',
        gender: 'm',
        password: faker.internet.password(),
        snsId: '',
      },
      {
        name: faker.name.findName(),
        provider: 'invalid',
        email: faker.internet.email(),
        gender: 'm',
        password: faker.internet.password(),
        snsId: '',
      },
    ];

    //Act, Assert
    for (let form of invalidForm) await request(app).post('/auth/signUp').send(form).expect(400);
  });
  it('이메일 형식이 아니면 400을 반환한다', async () => {
    const invalidForm: SignUpInterface = {
      name: '쿠키',
      provider: 'local',
      email: '1234',
      gender: 'm',
      password: faker.internet.password(),
      snsId: '',
    };

    await request(app).post('/auth/signUp').send(invalidForm).expect(400);
  });

  it('이메일이 50글자 초과하면 400을 반환한다', async () => {
    // 이메일 51자
    const invalidForm: SignUpInterface = {
      name: '쿠키',
      provider: 'local',
      gender: 'm',
      email: '12345678901234567890123456789012345678901@naver.com',
      password: faker.internet.password(),
      snsId: '',
    };

    await request(app).post('/auth/signUp').send(invalidForm).expect(400);
  });

  it('닉네임이 2글자 미만, 10글자 초과이면 400을 반환한다', async () => {
    let invalidForm: SignUpInterface = {
      name: '쿠',
      provider: 'local',
      gender: 'm',
      email: faker.internet.email(),
      password: faker.internet.password(),
      snsId: '',
    };

    // 1글자
    await request(app).post('/auth/signUp').send(invalidForm).expect(400);

    // 11글자
    invalidForm.name = '12345678901';
    await request(app).post('/auth/signUp').send(invalidForm).expect(400);
  });

  it('비밀번호가 20글자 초과이면 400을 반환한다', async () => {
    // 21글자
    let invalidForm: SignUpInterface = {
      name: '쿠키',
      provider: 'local',
      gender: 'm',
      email: faker.internet.email(),
      password: '123456789012345678901',
      snsId: '',
    };

    await request(app).post('/auth/signUp').send(invalidForm).expect(400);
  });

  it('유효하지 않은 성별이면 400을 반환한다', async () => {
    // 21글자
    let invalidForm: SignUpInterface = {
      name: '쿠키',
      provider: 'local',
      gender: '',
      email: faker.internet.email(),
      password: faker.internet.password(),
      snsId: '',
    };

    await request(app).post('/auth/signUp').send(invalidForm).expect(400);

    invalidForm.gender = 'z';

    await request(app).post('/auth/signUp').send(invalidForm).expect(400);
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
