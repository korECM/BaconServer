import mongoose, { Schema } from 'mongoose';
import faker from 'faker/locale/ko';
import { setupDB } from '../DBTestUtil';
import User, { UserSchemaInterface } from '../../DB/models/User';
import { UserController } from '../../DB/controller/User/UserController';

setupDB();

describe('UserController', () => {
  let dataUser: UserSchemaInterface;
  let kakaouser: UserSchemaInterface;
  let testShopId = new mongoose.Types.ObjectId();
  beforeAll(async () => {
    dataUser = await User.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
      provider: 'local',
      gender: 'm',
      isAdmin: false,
      registerDate: new Date(),
      likeShop: [testShopId],
      snsId: 'none',
      kakaoNameSet: true,
    });

    kakaouser = await User.create({
      email: 'none',
      name: faker.name.findName(),
      password: 'none',
      provider: 'kakao',
      gender: 'm',
      isAdmin: false,
      registerDate: new Date(),
      likeShop: [],
      snsId: 'kakaoId',
      kakaoNameSet: true,
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

  describe('addLikeShop', () => {
    it('user의 likeShop에 해당 가게 id가 없는 경우 해당 가게 id 추가', async () => {
      // Arrange
      let userController = new UserController();
      let shopId = new mongoose.Types.ObjectId();

      // Act
      await userController.addLikeShop(dataUser, shopId);

      // Assert
      expect(dataUser.likeShop.length).toBe(2);
      expect((dataUser.likeShop as mongoose.Types.ObjectId[]).includes(shopId)).toBeTruthy();
    });

    it('user의 likeShop에 이미 가게 id가 존재하면 추가하지 않는다', async () => {
      // Arrange
      let userController = new UserController();
      let prevLength = dataUser.likeShop.length;

      // Act
      await userController.addLikeShop(dataUser, testShopId);

      // Assert
      expect(dataUser.likeShop.length).toBe(prevLength);
      expect((dataUser.likeShop as mongoose.Types.ObjectId[]).includes(testShopId)).toBeTruthy();
    });
  });

  describe('unlikeShop', () => {
    it('user의 likeShop에 해당 가게 id가 없으면 아무런 일 없다', async () => {
      // Arrange
      let userController = new UserController();
      let shopId = new mongoose.Types.ObjectId();
      let prevLength = dataUser.likeShop.length;

      // Act
      await userController.unlikeShop(dataUser, shopId);

      // Assert
      expect(dataUser.likeShop.length).toBe(prevLength);
      expect((dataUser.likeShop as mongoose.Types.ObjectId[]).includes(shopId)).toBeFalsy();
    });
    it('user의 likeShop에 해당 가게 id가 있으면 지운다', async () => {
      // Arrange
      let userController = new UserController();
      let shopId = new mongoose.Types.ObjectId();

      // Act
      await userController.addLikeShop(dataUser, shopId);
      let changedUser = await userController.findById(dataUser._id);
      let prevLength = changedUser!.likeShop.length;
      await userController.unlikeShop(dataUser, shopId);
      changedUser = await userController.findById(dataUser._id);

      // Assert
      expect(changedUser!.likeShop.length).toBe(prevLength - 1);
      expect((changedUser!.likeShop as mongoose.Types.ObjectId[]).includes(shopId)).toBeFalsy();
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
      let user = await userController.createLocalUser(name, email, password, 'm');

      // Assert
      expect(user).not.toBeNull();
      if (user) {
        expect(user.name).toBe(name);
        expect(user.email).toBe(email);
        expect(user.provider).toBe('local');
        expect(user.gender).toBe('m');
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

  // describe('createKakaoUser', () => {
  //   it('주어진 데이터로 User를 만들고 UserInterface로 반환', async () => {
  //     // Arrange
  //     let name = faker.name.findName();
  //     let id = faker.internet.password();

  //     let userController = new UserController();
  //     // Act
  //     let user = await userController.createKakaoUser(name, id, true);

  //     // Assert
  //     expect(user).not.toBeNull();
  //     if (user) {
  //       expect(user.name).toBe(name);
  //       expect(user.snsId).toBe(id);
  //       expect(user.provider).toBe('kakao');
  //     }
  //   });
  // });
});
