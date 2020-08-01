import { IUserController } from '../DB/controller/User/IUserController';
import { UserController } from '../DB/controller/User/UserController';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserInterface } from '../DB/models/User';

export interface SignUpInterface {
  name: string;
  email?: string;
  password?: string;
  provider: string;
  snsId?: string;
}

export interface SignInInterface {
  email: string;
  password: string;
}

export class UserService {
  constructor(private UserDB: IUserController = new UserController()) {}

  private checkStringValidation(data: string | number | undefined) {
    if (typeof data === 'number') return !!data;
    return !!data && data.length > 0;
  }

  async signUp(form: SignUpInterface) {
    const { name, provider, email, password, snsId } = form;
    if (provider === 'local') {
      if (this.checkStringValidation(name) === false || this.checkStringValidation(password) === false || this.checkStringValidation(email) === false)
        return null;

      // 만약 가입하려는 이메일이 이미 존재한다면
      if ((await this.UserDB.checkEmailExist(email!)) === true) {
        return null;
      }

      // 가입하려는 닉네임이 이미 존재한다면
      if ((await this.UserDB.checkNameExist(name!)) === true) {
        // TODO: 어케할까
        return null;
      }

      const user = await this.UserDB.createLocalUser(name, email!, password!);

      return user;
    } else if (provider === 'kakao') {
      if (this.checkStringValidation(name) === false || this.checkStringValidation(snsId) === false) return null;

      let exKakaoUser = await this.UserDB.getKakaoUserExist(snsId!);

      if (exKakaoUser) return exKakaoUser;

      // 가입된 카카오 계정이 없다면 생성
      let userController = new UserController();
      let createdKakaoUser = await userController.createKakaoUser(name!, snsId!);

      return createdKakaoUser;
    } else {
      return null;
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
}
