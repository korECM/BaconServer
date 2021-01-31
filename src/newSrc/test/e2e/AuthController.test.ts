import request from "supertest";
import express from "express";
import {App} from "../../app";
import {getTestServer, tearDownTestServer} from "../utils/MockServer";
import {UserSeed} from "../utils/seeds/UserSeed";
import {Gender, Role} from "../../domains/User/User";
import {FoodingSeed} from "../utils/seeds/FoodingSeed";
import jwt from "jsonwebtoken"
import env from "../../env";

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

    function checkToken(accessToken: string, user: any) {
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
            const cookies: string = header['set-cookie'].filter((c: string) => c.startsWith('access_token'))
            expect(cookies.length).toBeGreaterThan(0)
            const accessToken: string = cookies[0].split('=')[1].split(';')[0]

            expect(accessToken).not.toBeUndefined()
            expect(accessToken).not.toBeNull()
            checkToken(accessToken, user)
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
            const cookies: string = header['set-cookie'].filter((c: string) => c.startsWith('access_token'))
            expect(cookies.length).toBeGreaterThan(0)
            const accessToken: string = cookies[0].split('=')[1].split(';')[0]

            expect(accessToken).not.toBeUndefined()
            expect(accessToken).not.toBeNull()
            checkToken(accessToken, {name, email, role: Role.user})
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


})