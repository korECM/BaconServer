import {Service} from "typedi";
import {UserRepository} from "../repositories/UserRepository";
import {InjectRepository} from "typeorm-typedi-extensions";
import {EntityNotExists, NotDefinedError} from "../repositories/Errors/CommonError";
import {UserForSignIn} from "../Dtos/User";

@Service()
export class UserAuthService {
    constructor(@InjectRepository() private userRepository: UserRepository) {
    }

    async signInLocal(email: string, password: string) {
        try {
            const user = await this.userRepository.getLocalUser(email);
            if (await user.hasPassword(password)) {
                return new UserForSignIn(user.id, user.name, user.email, user.gender, user.role, user.snsNameSet);
            } else {
                return null;
            }
        } catch (e) {
            if (e instanceof EntityNotExists) {
                return null;
            } else {
                throw new NotDefinedError(e);
            }
        }
    }
}