import {Gender, Role} from "../domains/User/User";

export class UserForSignIn {
    constructor(public id: number, public name: string, public email: string | null, gender: Gender, role: Role) {
    }
}