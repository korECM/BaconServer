import { IUserController } from '../DB/controller/User/IUserController';
import { UserController } from '../DB/controller/User/UserController';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserInterface } from '../DB/models/User';
import { IShopController } from '../DB/controller/Shop/IShopController';
import { ShopController } from '../DB/controller/Shop/ShopController';

export interface SignUpInterface {
  name: string;
  email?: string;
  password?: string;
  provider: string;
  gender: string;
  snsId?: string;
}

export interface SignInInterface {
  email: string;
  password: string;
}

export class UserService {
  constructor(private UserDB: IUserController = new UserController(), private ShopDB: IShopController = new ShopController()) {}

  private checkStringValidation(data: string | number | undefined) {
    if (typeof data === 'number') return !!data;
    return !!data && data.length > 0;
  }

  async signUp(form: SignUpInterface, withName: boolean) {
    const { name, provider, email, password, snsId } = form;
    if (provider === 'local') {
      if (this.checkStringValidation(name) === false || this.checkStringValidation(password) === false || this.checkStringValidation(email) === false)
        return {
          user: null,
          error: '적절하지 않은 양식입니다',
        };

      // 만약 가입하려는 이메일이 이미 존재한다면
      if ((await this.UserDB.checkEmailExist(email!)) === true) {
        return {
          user: null,
          error: '이미 사용중인 이메일입니다',
        };
      }

      // 가입하려는 닉네임이 이미 존재한다면
      if ((await this.UserDB.checkNameExist(name!)) === true) {
        return {
          user: null,
          error: '이미 사용중인 닉네임입니다',
        };
      }

      const user = await this.UserDB.createLocalUser(name, email!, password!, 'm');

      return { user, error: null };
    } else if (provider === 'kakao') {
      // if (this.checkStringValidation(name) === false || this.checkStringValidation(snsId) === false) return null;

      // let exKakaoUser = await this.UserDB.getKakaoUserExist(snsId!);

      // if (exKakaoUser) return exKakaoUser;

      // // 가입된 카카오 계정이 없다면 생성
      // let userController = new UserController();
      // let createdKakaoUser = await userController.createKakaoUser(name!, snsId!, withName);

      // return createdKakaoUser;
      return {
        user: null,
        error: '',
      };
    } else {
      return {
        user: null,
        error: '',
      };
    }
  }

  async signIn(form: SignInInterface) {
    const { email, password } = form;
    if (this.checkStringValidation(email) === false || this.checkStringValidation(password) === false) return null;
    try {
      const user = await this.UserDB.findByEmail(email);
      // 해당 이메일을 가진 유저가 존재하지 않으면
      if (user === null) return null;

      if ((await bcrypt.compare(password, user.password)) === false) return null;

      delete user.password;

      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async addLikeShop(userId: string, shopId: string) {
    try {
      let user = await this.UserDB.findById(userId);
      if (!user) return false;

      let shop = await this.ShopDB.findById(shopId);
      if (!shop) return false;

      await this.UserDB.addLikeShop(user, shop._id);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async unlikeShop(userId: string, shopId: string) {
    try {
      let user = await this.UserDB.findById(userId);
      if (!user) return false;

      let shop = await this.ShopDB.findById(shopId);
      if (!shop) return false;

      await this.UserDB.unlikeShop(user, shop._id);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
