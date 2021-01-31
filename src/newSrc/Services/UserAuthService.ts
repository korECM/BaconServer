import {Service} from "typedi";
import {UserRepository} from "../repositories/UserRepository";
import {InjectRepository} from "typeorm-typedi-extensions";
import {EntityNotExists, NotDefinedError} from "../repositories/Errors/CommonError";
import {
    UserForLocalSignInRequest,
    UserForLocalSignUpRequest,
    UserForSignInResponse,
    UserForSnsSignInRequest,
    UserForSnsSignUpRequest
} from "../Dtos/User";
import {User} from "../domains/User/User";

@Service()
export class UserAuthService {
    constructor(@InjectRepository() private userRepository: UserRepository) {
    }

    async userExistById(id: number): Promise<boolean> {
        return !!(await this.findUserById(id))
    }

    async findUserById(id: number): Promise<User | undefined> {
        return await this.userRepository.findOne({id})
    }

    async signInLocal(userDto: UserForLocalSignInRequest) {
        try {
            const user = await this.userRepository.getLocalUser(userDto.email);
            if (await user.hasPassword(userDto.password)) {
                return new UserForSignInResponse(user.id, user.name, user.email, user.gender, user.role, user.snsNameSet);
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

    async signUpLocal(userDto: UserForLocalSignUpRequest) {
        if (await this.userRepository.nameExists(userDto.name)) {
            return null;
        }
        if (await this.userRepository.emailExists(userDto.email)) {
            return null;
        }
        const user = await this.userRepository.addLocalUser(userDto.name, userDto.email, userDto.password, userDto.gender);
        return new UserForSignInResponse(user.id, user.name, user.email, user.gender, user.role, user.snsNameSet);
    }

    async signInSns(userDto: UserForSnsSignInRequest) {
        try {
            const user = await this.userRepository.getSnsUser(userDto.snsId, userDto.provider);
            return new UserForSignInResponse(user.id, user.name, user.email, user.gender, user.role, user.snsNameSet);
        } catch (e) {
            if (e instanceof EntityNotExists) {
                return null;
            } else {
                throw new NotDefinedError(e);
            }
        }
    }

    async signUpSns(userDto: UserForSnsSignUpRequest) {
        if (await this.userRepository.snsUserExists(userDto.snsId, userDto.provider)) {
            return null;
        }
        const user = await this.userRepository.addSnsUser(userDto.name, userDto.email, userDto.snsId, userDto.provider, userDto.gender);
        return new UserForSignInResponse(user.id, user.name, user.email, user.gender, user.role, user.snsNameSet);
    }
}