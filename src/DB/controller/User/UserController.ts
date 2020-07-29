import User, { UserInterface } from '../../models/User';
import bcrypt from 'bcrypt';
import { IUserController } from './IUserController';

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

  async createLocalUser(name: string, email: string, password: string) {
    let hashPassword = await bcrypt.hash(password, 12);
    let user = new User({
      name,
      email,
      provider: 'local',
      snsId: 'none',
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
}