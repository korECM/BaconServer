import request from "supertest";
import express from "express";
import {App} from "../../app";
import {getTestServer, tearDownTestServer} from "../utils/MockServer";
import {UserSeed} from "../utils/seeds/UserSeed";
import {UserForSignInResponse} from "../../Dtos/User";
import {Gender, Role} from "../../domains/User/User";
import {FoodingSeed} from "../utils/seeds/FoodingSeed";

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

    describe("/signIn", () => {
        it("200: 로그인에 성공하면 UserForSignInResponse 반환한다", async () => {
            // given
            const user = UserSeed[0];

            // when
            const {body} = await request(expressApp)
                .post("/auth/signIn")
                .send({
                    email: user.email!,
                    password: user.password!
                })
                .expect(200);

            // then
            expect(body).toEqual(new UserForSignInResponse(user.id, user.name, user.email, user.gender, user.role, user.snsNameSet));
            expect(body.snsNameSet).toBeTrue();
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
        it("201: 회원가입에 성공하면 UserForSignInResponse 반환한다", async () => {
            // given
            const name = "newName";
            const email = "123asdf@naver.com";
            const gender = Gender.m;
            const password = "newPassword";

            // when
            const {body} = await request(expressApp)
                .post("/auth/signUp")
                .send({
                    name, email, gender, password
                })
                .expect(201);

            // then
            expect(body).toEqual(new UserForSignInResponse(UserSeed.length + 1, name, email, gender, Role.user, true));
            expect(body.snsNameSet).toBeTrue();
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