import { UserSchemaInterface, UserInterface } from '../../models/User';

export interface IUserController {
  findById(id: string): Promise<UserSchemaInterface | null>;
  checkEmailExist(email: string): Promise<boolean>;
  checkNameExist(name: string): Promise<boolean>;
  createLocalUser(name: string, email: string, password: string): Promise<UserInterface>;
}
