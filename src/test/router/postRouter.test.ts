import request from 'supertest';
import { app } from '../../index';
import { SignUpInterface } from '../../service/UserService';
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

    //Act
    let result = [];
    for (let form of invalidForm) {
      let tempResult = await request(app).post('/auth/signUp').send(form);
      result.push(tempResult.status);
    }

    // Assert
    expect(result.every((status) => status === 400)).toBe(true);
  });
});
