import { IUserController } from '../DB/controller/User/IUserController';
import { UserController } from '../DB/controller/User/UserController';
import jwt from 'jsonwebtoken';
import { UserInterface } from '../DB/models/User';

export interface SignUpInterface {
  name: string;
  email?: string;
  password?: string;
  provider: string;
  snsId?: string;
}

export class UserService {
  constructor(private UserDB: IUserController = new UserController()) {}

  private checkStringValidation(data: string | undefined) {
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
      return null;
    } else {
      return null;
    }
  }

  generateToken(user: UserInterface) {
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '7d',
      },
    );
    return token;
  }
}
