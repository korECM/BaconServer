import {Service} from "typedi";
import {UserRepository} from "../repositories/UserRepository";
import {InjectRepository} from "typeorm-typedi-extensions";
import {EntityNotExists, NotDefinedError} from "../repositories/Errors/CommonError";
import {
    UserForLocalSignInRequest,
    UserForLocalSignUpRequest,
    UserForSignInResponse,
    UserForSnsSignUpRequest
} from "../Dtos/User";
import {AuthProvider} from "../domains/User/User";

@Service()
export class UserAuthService {
    constructor(@InjectRepository() private userRepository: UserRepository) {
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
        const user = await this.userRepository.addLocalUser(userDto.name, userDto.email, userDto.password, userDto.gender);
        return new UserForSignInResponse(user.id, user.name, user.email, user.gender, user.role, user.snsNameSet);
    }

    async signInSns(snsId: string, provider: AuthProvider) {
        try {
            const user = await this.userRepository.getSnsUser(snsId, provider);
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
        const user = await this.userRepository.addSnsUser(userDto.name, userDto.email, userDto.snsId, userDto.provider, userDto.gender);
        return new UserForSignInResponse(user.id, user.name, user.email, user.gender, user.role, user.snsNameSet);
    }
}