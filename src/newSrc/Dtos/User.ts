import {AuthProvider, Gender, Role} from "../domains/User/User";
import {IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateIf} from "class-validator";

export class UserForSignInResponse {
    @IsNumber()
    @IsNotEmpty()
    public id: number;
    @IsString()
    @IsNotEmpty()
    public name: string;
    @ValidateIf(o => !o)
    @IsString()
    @IsNotEmpty()
    public email: string | null;
    public gender: Gender;
    @IsNotEmpty()
    @IsEnum(Role)
    public role: Role;
    @IsBoolean()
    public snsNameSet: boolean;

    constructor(id: number, name: string, email: string | null, gender: Gender, role: Role, snsNameSet: boolean) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.gender = gender;
        this.role = role;
        this.snsNameSet = snsNameSet;
    }
}

export class UserForLocalSignInRequest {
    @IsEmail()
    @IsString()
    public email: string;
    @IsString()
    @IsNotEmpty()
    public password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}

export class UserForSnsSignInRequest {
    constructor(public snsId: string, public provider: AuthProvider) {
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