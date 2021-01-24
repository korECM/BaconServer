import {Response} from 'express';
import {Body, HttpCode, JsonController, OnNull, OnUndefined, Post, Res} from "routing-controllers";
import {OpenAPI, ResponseSchema} from "routing-controllers-openapi";
import {UserAuthService} from "../Services/UserAuthService";
import {UserForLocalSignInRequest, UserForSignInResponse} from "../Dtos/User";


@JsonController("/user")
export class UserController {
    constructor(private userAuthService: UserAuthService) {
    }

    @Post("/signIn")
    @HttpCode(200)
    @ResponseSchema(UserForSignInResponse)
    @OpenAPI({
        description: "Local 로그인을 시도하는 라우터",
        responses: {
            '200': {
                description: "로그인을 성공한 경우 -> UserForSignIn 반환한다",
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
}