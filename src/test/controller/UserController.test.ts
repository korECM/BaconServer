import mongoose, { Schema } from 'mongoose';
import faker from 'faker/locale/ko';
import { setupDB } from '../DBTestUtil';
import User, { UserSchemaInterface } from '../../DB/models/User';
import { UserController } from '../../DB/controller/User/UserController';

setupDB('User');

describe('UserController', () => {
  let dataUser: UserSchemaInterface;
  beforeAll(async () => {
    dataUser = await User.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
      provider: 'local',
      registerDate: new Date(),
      snsId: 'none',
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
});