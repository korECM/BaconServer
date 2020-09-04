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

  async unlikeShop(user: UserSchemaInterface, shopId: mongoose.Types.ObjectId) {
    if ((user.likeShop as mongoose.Types.ObjectId[]).includes(shopId) == true) {
      user.likeShop = (user.likeShop as mongoose.Types.ObjectId[]).filter((shop) => shop.toHexString() !== shopId.toHexString());
      await user.save();
    }
  }

  async createLocalUser(name: string, email: string, password: string, gender: string) {
    let hashPassword = await bcrypt.hash(password, 12);
    let user = new User({
      name,
      email,
      provider: 'local',
      snsId: 'none',
      likeShop: [],
      gender,
      isAdmin: false,
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

  async setName(id: string, name: string, gender: string) {
    let user = await User.findById(id);
    if (!user)
      return {
        user: null,
        error: '해당 유저가 존재하지 않습니다',
      };
    let exUser = await User.find({ name });
    if (exUser.length > 0)
      return {
        user: null,
        error: '이미 사용중인 닉네임입니다',
      };

    user.name = name;
    user.gender = gender;
    user.kakaoNameSet = true;
    await user.save();

    return { user: user as UserInterface, error: null };
  }

  async getKakaoUserExist(id: string): Promise<UserInterface | null> {
    return await User.findOne({ provider: 'kakao', snsId: id });
  }

  async createKakaoUser(name: string, id: string, withName: boolean) {
    try {
      let user = new User({
        name,
        email: 'none',
        provider: 'kakao',
        likeShop: [],
        gender: 'none',
        snsId: id,
        password: 'none',
        isAdmin: false,
        kakaoNameSet: withName,
      });

      await user.save();

      return user as UserInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
