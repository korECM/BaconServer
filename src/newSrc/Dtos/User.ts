import {AuthProvider, Gender, Role} from "../domains/User/User";

export class UserForSignInResponse {
    constructor(public id: number, public name: string, public email: string | null, public gender: Gender, public role: Role, public snsNameSet: boolean) {
    }
}

export class UserForLocalSignUpRequest {
    constructor(public name: string, public email: string, public gender: Gender, public password: string) {
    }
}

export class UserForSnsSignUpRequest {
    constructor(public name: string, public email: string | null, public snsId: string, public gender: Gender, public provider: AuthProvider) {
    }
}