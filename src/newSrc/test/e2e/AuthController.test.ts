import request from "supertest";
import express from "express";
import {App} from "../../app";
import {getTestServer, tearDownTestServer} from "../utils/MockServer";
import {UserSeed} from "../utils/seeds/UserSeed";
import {Gender, Role} from "../../domains/User/User";
import {FoodingSeed} from "../utils/seeds/FoodingSeed";
import jwt from "jsonwebtoken"
import env from "../../env";
import sinon, {SinonSandbox, SinonStub} from "sinon"
import axios from "axios";
import {AuthController} from "../../controllers/AuthController";

describe("/auth", () => {
    let app: App;
    let expressApp: express.Application;

    beforeAll(async () => {
        app = getTestServer();
        await app.setDatabase();
        await app.initDomain();
        expressApp = app.app;
    });

    beforeEach(async () => {
        await FoodingSeed.setUp(app.connection);
    })

    afterAll(() => {
        tearDownTestServer();
    });

    function checkToken(header: Record<string, any>, user: any) {
        const cookies: string = header['set-cookie'].filter((c: string) => c.startsWith('access_token'))
        expect(cookies.length).toBeGreaterThan(0)
        const accessToken: string = cookies[0].split('=')[1].split(';')[0]

        expect(accessToken).not.toBeUndefined()
        expect(accessToken).not.toBeNull()
        try {
            const decoded = jwt.verify(accessToken, env.secret.jwt) as Record<string, any>;
            if (user.id)
                expect(decoded._id).toBe(user.id)
            expect(decoded.name).toBe(user.name)
            expect(decoded.email).toBe(user.email)
            expect(decoded.isAdmin).toBe(user.role === Role.admin)
        } catch (e) {
            fail(e)
        }
    }

    describe("/signIn", () => {
        it("200: 로그인에 성공하면 access_token을 설정한다", async () => {
            // given
            const user = UserSeed[0];

            // when
            const {header} = await request(expressApp)
                .post("/auth/signIn")
                .send({
                    email: user.email!,
                    password: user.password!
                })
                .expect(200);

            // then
            checkToken(header, user)
        })

        it("409: 로그인에 실패하면 null을 반환한다", async () => {
            // given
            const user = UserSeed[0];
            const invalidData = [{
                email: "asdf" + user.email!,
                password: user.password!
            }, {
                email: user.email!,
                password: user.password! + "123"
            }]

            // when
            const bodyList = [];
            for (let data of invalidData) {
                const {body} = await request(expressApp)
                    .post("/auth/signIn")
                    .send(data)
                    .expect(409);
                bodyList.push(body);
            }

            // then
            expect(bodyList).toSatisfyAll(e => e === null);
        })

        it("400: 인자가 잘못 전달되면 message:Invalid Request 반환한다", async () => {
            // given
            const invalidData = [{
                email: "notEmail",
                password: "1234"
            }, {
                email: "asdfa@naver.com"
            }, {
                password: "1234"
            }]

            // when
            const bodyList = [];
            for (let data of invalidData) {
                const {body} = await request(expressApp)
                    .post("/auth/signIn")
                    .send(data)
                    .expect(400);
                bodyList.push(body);
            }

            // then
            expect(bodyList).toSatisfyAll(e => e.message === "Invalid Request");
        })
    })

    describe("/signUp", () => {
        it("201: 회원가입에 성공하면  access_token을 설정한다", async () => {
            // given
            const name = "newName";
            const email = "123asdf@naver.com";
            const gender = Gender.m;
            const password = "newPassword";

            // when
            const {header} = await request(expressApp)
                .post("/auth/signUp")
                .send({
                    name, email, gender, password
                })
                .expect(201);

            // then
            checkToken(header, {name, email, role: Role.user})
        })

        it("409: 회원가입에 실패하면 null을 반환한다", async () => {
            // given
            const user = UserSeed[0];
            const invalidData = [{
                name: user.name,
                email: "new" + user.email,
                gender: user.gender,
                password: user.password
            }, {
                name: "new" + user.name,
                email: user.email,
                gender: user.gender,
                password: user.password
            }]

            // when
            const bodyList = [];
            for (let data of invalidData) {
                const {body} = await request(expressApp)
                    .post("/auth/signUp")
                    .send(data)
                    .expect(409);
                bodyList.push(body);
            }

            // then
            expect(bodyList).toSatisfyAll(e => e === null);
        })

        it("400: 인자가 잘못 전달되면 message:Invalid Request 반환한다", async () => {
            // given
            const name = "newName";
            const email = "123asdf@naver.com";
            const gender = Gender.m;
            const password = "newPassword";
            const invalidData = [{
                name: "짧", email, gender, password
            }, {
                name: "이거는글자수보다길지롱", email, gender, password
            }, {
                name, email, gender, password: "너무 긴 패스워드는 사용할 수 없으니까 그냥 테스트~"
            }, {
                name, email, gender: "새로운 성", password
            }, {
                name, email, gender
            }, {
                name, gender, password
            }]

            // when
            const bodyList = [];
            for (let data of invalidData) {
                const {body} = await request(expressApp)
                    .post("/auth/signUp")
                    .send(data)
                    .expect(400);
                bodyList.push(body);
            }

            // then
            expect(bodyList).toSatisfyAll(e => e.message === "Invalid Request");
        })
    })

    describe('/signIn/kakao/callback', () => {
        let sb: SinonSandbox = sinon.createSandbox()
        let get: SinonStub
        const code = 1
        const accessToken = 1234
        const tokenRequestURL = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${env.api.kakao.restApiKey}&redirect_uri=${AuthController.kakaoCallbackLink}&code=${code}`;

        beforeEach(() => {
            get = sb.stub(axios, 'get')
        })

        afterEach(() => {
            sb.restore()
        })

        it('500: code로부터 카카오 토큰을 얻어오는데 실패한 경우', async () => {
            // given
            get.withArgs(tokenRequestURL).resolves({data: {access_token: null, error: {}}})
            // when
            await request(expressApp)
                .get("/auth/signIn/kakao/callback")
                .query({code})
                .expect(504);
            // then
        })
        it('206: 가입한 계정이 존재하지 않는 경우', async () => {
            // given
            get.withArgs(tokenRequestURL).resolves({data: {access_token: accessToken, error: null}})
            get.withArgs('https://kapi.kakao.com/v2/user/me').resolves({data: {id: 1234}})
            // when
            const {body} = await request(expressApp)
                .get("/auth/signIn/kakao/callback")
                .query({code})
                .expect(206);
            // then
            expect(body).not.toBeUndefined()
            expect(body).not.toBeNull()
            expect(body.id).toBeDefined()
            expect(body.status).toBe(303)
        })

        it('206: 가입한 계정이 존재하지만 아직 이름을 설정하지 않은 경우', async () => {
            // given
            const user = UserSeed[2]
            get.withArgs(tokenRequestURL).resolves({data: {access_token: accessToken, error: null}})
            get.withArgs('https://kapi.kakao.com/v2/user/me').resolves({data: {id: user.snsId}})
            // when
            const {body} = await request(expressApp)
                .get("/auth/signIn/kakao/callback")
                .query({code})
                .expect(206);
            // then
            expect(body).not.toBeUndefined()
            expect(body).not.toBeNull()
            expect(body.id).toBeDefined()
            expect(body.status).toBe(303)
        })

        it('200: 가입한 계정이 존재하고 닉네임도 설정한 경우', async () => {
            // given
            const user = UserSeed[1]
            get.withArgs(tokenRequestURL).resolves({data: {access_token: accessToken, error: null}})
            get.withArgs('https://kapi.kakao.com/v2/user/me').resolves({data: {id: user.snsId}})
            // when
            const {header} = await request(expressApp)
                .get("/auth/signIn/kakao/callback")
                .query({code})
                .expect(200);
            // then
            checkToken(header, user)
        })
    })

})