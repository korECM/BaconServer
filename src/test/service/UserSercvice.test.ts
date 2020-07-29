import { UserService, SignUpInterface, SignInInterface } from '../../service/UserService';
import Sinon from 'sinon';
import faker from 'faker/locale/ko';
import bcrypt from 'bcrypt';
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

  describe('signIn', () => {
    let userController: UserController;
    let userDBStub: Sinon.SinonStubbedInstance<UserController>;
    let userService: UserService;

    const validForm = {
      email: faker.internet.exampleEmail(),
      password: faker.internet.password(),
    };

    beforeEach(async () => {
      userController = new UserController();
      userDBStub = Sinon.stub(userController);
      userService = new UserService(userDBStub);
    });
    it('email 또는 password가 주어지지 않으면 null 반홤', async () => {
      // Arrange
      let invalidForm: SignInInterface[] = [
        {
          email: '',
          password: '',
        },
        {
          email: faker.internet.email(),
          password: '',
        },
        {
          email: '',
          password: faker.internet.password(),
        },
      ];
      // Act
      let result: any[] = [];
      for (let form of invalidForm) {
        let response = await userService.signIn(form);
        result.push(response);
      }
      // Assert
      expect(result.every((user) => user === null)).toBe(true);
    });

    it('해당 이메일을 가진 유저가 존재하지 않으면 null을 반환', async () => {
      // Arrange
      userDBStub.findByEmail.resolves(null);
      // Act
      let user = await userService.signIn(validForm);
      // Assert
      expect(user).toBeNull();
    });

    it('해당 이메일을 가진 유저가 존재하지만 비밀번호가 일치하지 않으면 null을 반환', async () => {
      // Arrange
      let hashPassword = await bcrypt.hash(validForm.password + '*', 12);
      userDBStub.findByEmail.resolves({
        _id: 1,
        email: 'test@naver.com',
        name: 'name',
        password: hashPassword,
        provider: 'local',
        registerDate: new Date(),
        snsId: '',
      });
      // Act
      let user = await userService.signIn(validForm);
      // Assert
      expect(user).toBeNull();
    });
  });
});
