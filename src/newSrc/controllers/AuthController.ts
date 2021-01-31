import {Response} from 'express';
import {
    Body,
    Get,
    HttpCode,
    HttpError,
    JsonController,
    OnNull,
    OnUndefined,
    Post,
    QueryParam,
    Redirect,
    Res
} from "routing-controllers";
import {OpenAPI} from "routing-controllers-openapi";
import {UserAuthService} from "../Services/UserAuthService";
import {
    UserForLocalSignInRequest,
    UserForLocalSignUpRequest,
    UserForSnsSignInRequest,
    UserForSnsSignUpRequest
} from "../Dtos/User";
import {NotificationService} from "../Services/NotificationService";
import {Slack} from "../infrastructures/notification/Slack";
import env from "../env";
import axios from "axios";
import {AuthProvider, Gender} from "../domains/User/User";
import {AuthMiddleware} from "../middlewares/AuthMiddleware";
import Channel = Slack.Channel;


@JsonController("/auth")
export class AuthController {
    constructor(private userAuthService: UserAuthService, private notificationService: NotificationService) {
    }

    @Post("/signIn")
    @HttpCode(200)
    @OpenAPI({
        description: "Local 로그인을 시도하는 라우터",
        responses: {
            '200': {
                description: "로그인을 성공한 경우 access_token을 설정한다",
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
        const user = await this.userAuthService.signInLocal(signInDto);
        if (!user) return null
        AuthMiddleware.userToToken(res, user)
        return {message: "success"}
    }

    @Post("/signUp")
    @HttpCode(201)
    @OpenAPI({
        description: "Local 회원가입을 시도하는 라우터",
        responses: {
            '201': {
                description: "로그인을 성공한 경우 access_token을 설정한다",
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
        const user = await this.userAuthService.signUpLocal(signUpDto);
        if (!user) return null
        if (env.isProduction) {
            this.notificationService.sendMessage(`${user.name}님이 새로 가입했어요! by Local`, Channel.FOODING_SIGNUP)
        }
        AuthMiddleware.userToToken(res, user)
        return {message: "success"}
    }

    static kakaoCallbackLink = env.isDevelopment ? 'http://localhost:3000/auth/kakao/callback' : 'https://caufooding.com/auth/kakao/callback'

    @Get('/signIn/kakao')
    @Redirect(`https://kauth.kakao.com/oauth/authorize?client_id=${env.api.kakao.restApiKey}&redirect_uri=${AuthController.kakaoCallbackLink}&response_type=code`)
    @OpenAPI({
        description: "카카오 회원가입 Redirect 링크",
    })
    async kakaoRedirect() {
    }

    @Get('/signIn/kakao/callback')
    @HttpCode(200)
    @OpenAPI({
        description: "카카오 회원가입 처리하는 라우터",
        responses: {
            '206': {
                description: "가입한 계정이 존재하지 않거나 닉네임 설정이 되지 않은 경우"
            },
            '200': {
                description: "로그인에 성공한 경우"
            },
            '504': {
                description: "카카오 로그인 서버에 오류가 발생한 경우"
            }
        }
    })
    async kakaoSignIn(@QueryParam('code') code: string, @Res() res: Response) {
        const tokenRequestURL = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${env.api.kakao.restApiKey}&redirect_uri=${AuthController.kakaoCallbackLink}&code=${code}`;
        const {data: {access_token, error}} = await axios.get(tokenRequestURL)
        if (error) {
            if (!env.isTest) {
                console.error(error)
            }
            throw new HttpError(504)
        }

        const {data: {id}} = await axios.get('https://kapi.kakao.com/v2/user/me', {headers: {Authorization: `Bearer ${access_token}`}});

        const user = await this.userAuthService.signInSns(new UserForSnsSignInRequest(id, AuthProvider.kakao));

        // 기존에 가입한 계정이 존재하지 않는 경우
        if (!user) {
            const newUser = await this.userAuthService.signUpSns(new UserForSnsSignUpRequest("설정 전 이름", null, id, Gender.none, AuthProvider.kakao))
            return res.status(206).send({id: newUser?.id, status: 303})
        }

        // 이미 가입한 계정이 존재하는 경우

        // 아직 닉네임 설정 안한 경우
        if (!user.snsNameSet) {
            return res.status(206).send({id: user.id, status: 303})
        }

        // 닉네임 설정이 된 카카오 유저

        AuthMiddleware.userToToken(res, user)
        return {message: "success"}
    }
}