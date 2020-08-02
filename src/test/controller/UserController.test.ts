import mongoose, { Schema } from 'mongoose';
import faker from 'faker/locale/ko';
import { setupDB } from '../DBTestUtil';
import User, { UserSchemaInterface } from '../../DB/models/User';
import { UserController } from '../../DB/controller/User/UserController';

setupDB('User');

describe('UserController', () => {
  let dataUser: UserSchemaInterface;
  let kakaouser: UserSchemaInterface;
  beforeAll(async () => {
    dataUser = await User.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
      provider: 'local',
      registerDate: new Date(),
      likeShop: [],
      snsId: 'none',
    });

    kakaouser = await User.create({
      email: 'none',
      name: faker.name.findName(),
      password: 'none',
      provider: 'kakao',
      registerDate: new Date(),
      likeShop: [],
      snsId: 'kakaoId',
    });
  });
  describe('findById', () => {
    it('id가 일치하는 User를 찾아서 있으면 해당 User를 반환한다', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const user = await userController.findById(dataUser._id);

      // Assert
      expect(user).not.toBeNull();
      if (user) {
        expect(user.id).toBe(dataUser.id);
      }
    });
    it('id가 일치하는 User가 없다면 null 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const user = await userController.findById(new mongoose.mongo.ObjectId().toHexString());

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('해당 유저 존재하면 해당 유저 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const user = await userController.findByEmail(dataUser.email);

      // Assert
      expect(user).not.toBeNull();
      if (user) {
        expect(user.email).toBe(dataUser.email);
      }
    });
    it('해당 유저 없으면 null 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const user = await userController.findByEmail(dataUser.email + '!');

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('checkEmailExist', () => {
    it('해당 이메일 존재하면 true 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const result = await userController.checkEmailExist(dataUser.email);

      // Assert
      expect(result).toBeTruthy();
    });
    it('해당 이메일 없으면 false 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const result = await userController.checkEmailExist(dataUser.email + '!');

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe('checkNameExist', () => {
    it('해당 이름 존재하면 true 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const result = await userController.checkNameExist(dataUser.name);

      // Assert
      expect(result).toBeTruthy();
    });
    it('해당 이름 없으면 false 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const result = await userController.checkEmailExist(dataUser.name + '헤');

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe('createLocalUser', () => {
    it('주어진 데이터로 User 만들고 UserInterface로 반환', async () => {
      // Arrange
      let name = faker.name.findName();
      let email = faker.internet.email();
      let password = faker.internet.password();

      let userController = new UserController();
      // Act
      let user = await userController.createLocalUser(name, email, password);

      // Assert
      expect(user).not.toBeNull();
      if (user) {
        expect(user.name).toBe(name);
        expect(user.email).toBe(email);
        expect(user.provider).toBe('local');
        // 비밀번호 평문 저장하면 안됨
        expect(user.password).not.toBe(password);
      }
    });
  });

  describe('checkKakaoUserExist', () => {
    it('중복되는 snsId가 존재해도 provider가 kakao가 아니면 nul 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const result = await userController.getKakaoUserExist(dataUser.snsId);

      // Assert
      expect(result).toBeNull();
    });

    it('중복되는 snsId 존재하고 provider가 kakao오면 true 반환', async () => {
      // Arrange
      let userController = new UserController();

      // Act
      const result = await userController.getKakaoUserExist(kakaouser.snsId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.snsId).toBe(kakaouser.snsId);
    });
  });

  describe('createKakaoUser', () => {
    it('주어진 데이터로 User를 만들고 UserInterface로 반환', async () => {
      // Arrange
      let name = faker.name.findName();
      let id = faker.internet.password();

      let userController = new UserController();
      // Act
      let user = await userController.createKakaoUser(name, id);

      // Assert
      expect(user).not.toBeNull();
      if (user) {
        expect(user.name).toBe(name);
        expect(user.snsId).toBe(id);
        expect(user.provider).toBe('kakao');
      }
    });
  });
});
