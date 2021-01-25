import {Response} from 'express';
import {Body, HttpCode, JsonController, OnNull, OnUndefined, Post, Res} from "routing-controllers";
import {OpenAPI, ResponseSchema} from "routing-controllers-openapi";
import {UserAuthService} from "../Services/UserAuthService";
import {UserForLocalSignInRequest, UserForLocalSignUpRequest, UserForSignInResponse} from "../Dtos/User";


@JsonController("/auth")
export class AuthController {
    constructor(private userAuthService: UserAuthService) {
    }

    @Post("/signIn")
    @HttpCode(200)
    @ResponseSchema(UserForSignInResponse)
    @OpenAPI({
        description: "Local 로그인을 시도하는 라우터",
        responses: {
            '200': {
                description: "로그인을 성공한 경우 -> UserForSignInResponse 반환한다",
            },
            '400': {
                description: "인자가 잘못 전달된 경우",
            },
            '409': {
                description: "일치하는 계정이 없는 경우",
            }
        },
    })
    @OnNull(409)
    @OnUndefined(409)
    async signInLocal(@Body() signInDto: UserForLocalSignInRequest, @Res() res: Response) {
        return await this.userAuthService.signInLocal(signInDto);
    }

    @Post("/signUp")
    @HttpCode(201)
    @ResponseSchema(UserForSignInResponse)
    @OpenAPI({
        description: "Local 회원가입을 시도하는 라우터",
        responses: {
            '201': {
                description: "회원가입에 성공한 경우 -> UserForSignInResponse 반환한다",
            },
            '400': {
                description: "인자가 잘못 전달된 경우",
            },
            '409': {
                description: "회원가입에 실패한 경우",
            }
        },
    })
    @OnNull(409)
    @OnUndefined(409)
    async signUpLocal(@Body() signUpDto: UserForLocalSignUpRequest, @Res() res: Response) {
        return await this.userAuthService.signUpLocal(signUpDto);
    }
}