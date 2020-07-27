import User, { UserInterface } from '../../models/User';
import bcrypt from 'bcrypt';

export class UserController {
  constructor() {}

  async findById(id: string) {
    return await User.findById(id);
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
      snsId: '',
      password: hashPassword,
    });

    await user.save();

    return user as UserInterface;
  }
}
