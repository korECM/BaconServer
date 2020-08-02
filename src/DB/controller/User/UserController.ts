import User, { UserInterface, UserSchemaInterface } from '../../models/User';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { IUserController } from './IUserController';
import { ShopInterface } from '../../models/Shop';

export class UserController implements IUserController {
  constructor() {}

  async findById(id: string) {
    return await User.findById(id);
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    return (await User.findOne({ email })) as UserInterface;
  }

  async checkEmailExist(email: string) {
    return (await User.findOne({ email })) !== null;
  }

  async checkNameExist(name: string) {
    return (await User.findOne({ name })) !== null;
  }

  async addLikeShop(user: UserSchemaInterface, shopId: mongoose.Types.ObjectId) {
    if ((user.likeShop as mongoose.Types.ObjectId[]).includes(shopId) == false) {
      (user.likeShop as mongoose.Types.ObjectId[]).push(shopId);
      await user.save();
    }
  }

  async createLocalUser(name: string, email: string, password: string) {
    let hashPassword = await bcrypt.hash(password, 12);
    let user = new User({
      name,
      email,
      provider: 'local',
      snsId: 'none',
      likeShop: [],
      password: hashPassword,
    });

    try {
      await user.save();

      return user as UserInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getKakaoUserExist(id: string): Promise<UserInterface | null> {
    return await User.findOne({ provider: 'kakao', snsId: id });
  }

  async createKakaoUser(name: string, id: string) {
    try {
      let user = new User({
        name,
        email: 'none',
        provider: 'kakao',
        likeShop: [],
        snsId: id,
        password: 'none',
      });

      await user.save();

      return user as UserInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
