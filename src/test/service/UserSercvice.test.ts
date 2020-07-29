import { UserService, SignUpInterface } from '../../service/UserService';
import Sinon from 'sinon';
import faker from 'faker/locale/ko';
import { UserController } from '../../DB/controller/User/UserController';
import { UserInterface } from '../../DB/models/User';
import dotenv from 'dotenv';
dotenv.config();

describe('UserService', () => {
  describe('signUp', () => {
    describe('localLogin', () => {
      let userController: UserController;
      let userDBStub: Sinon.SinonStubbedInstance<UserController>;
      let userService: UserService;

      const validForm = {
        name: faker.name.findName(),
        provider: 'local',
        email: faker.internet.exampleEmail(),
        password: faker.internet.password(),
      };

      beforeEach(async () => {
        userController = new UserController();
        userDBStub = Sinon.stub(userController);
        userService = new UserService(userDBStub);
      });

      it('name, email, password가 주어지지 않으면 null 반환', async () => {
        // Arrange
        let testData = [
          {
            provider: 'local',
          },
          {
            name: '',
            provider: 'local',
            email: faker.internet.exampleEmail(),
            password: faker.internet.password(),
          },
          {
            name: faker.name.findName(),
            provider: 'local',
            email: faker.internet.exampleEmail(),
            password: '',
          },
          {
            name: faker.name.findName(),
            provider: 'local',
            email: '',
            password: faker.internet.password(),
          },
        ];

        // Act
        let result: (null | UserInterface)[] = [];

        for (let data of testData) {
          result.push(await userService.signUp(data as any));
        }

        // Assert
        expect(result.every((data) => !!data)).toBe(false);
      });

      it('가입하려는 이메일이 이미 존재하면 null을 반환한다', async () => {
        // Arrange
        userDBStub.checkEmailExist.resolves(true);
        // Act
        let user = await userService.signUp(validForm);
        // Assert
        expect(user).toBeNull();
        expect(userDBStub.checkEmailExist.calledOnceWith(validForm.email)).toBe(true);
      });

      it('가입하려는 이름이 이미 존재하면 null을 반환한다', async () => {
        // Arrange
        userDBStub.checkEmailExist.resolves(false);
        userDBStub.checkNameExist.resolves(true);
        // Act
        let user = await userService.signUp(validForm);
        // Assert
        expect(user).toBeNull();
        expect(userDBStub.checkNameExist.calledOnceWith(validForm.name)).toBe(true);
      });

      it('form이 정상이고 이름과 이메일이 중복되지 않는다면 User를 만들고 이를 반환한다', async () => {
        // Arrange
        userDBStub.checkEmailExist.resolves(false);
        userDBStub.checkNameExist.resolves(false);
        let testDate = new Date();
        let testUser = {
          name: validForm.name,
          email: validForm.email,
          password: '',
          provider: 'local',
          registerDate: testDate,
          snsId: '',
          _id: '123456789',
        };
        userDBStub.createLocalUser.resolves(testUser);
        // Act
        let user = await userService.signUp(validForm);
        // Assert
        expect(user).toBe(testUser);
      });
    });
  });
});
