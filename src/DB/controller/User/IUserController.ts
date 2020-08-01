import { UserSchemaInterface, UserInterface } from '../../models/User';

export interface IUserController {
  findById(id: string): Promise<UserSchemaInterface | null>;
  findByEmail(email: string): Promise<UserInterface | null>;
  checkEmailExist(email: string): Promise<boolean>;
  checkNameExist(name: string): Promise<boolean>;
  createLocalUser(name: string, email: string, password: string): Promise<UserInterface | null>;
  getKakaoUserExist(id: string): Promise<UserInterface | null>;
  createKakaoUser(name: string, id: string): Promise<UserInterface | null>;
}
