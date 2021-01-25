import {PostRepository} from "../../repositories/PostRepository";
import {PostSeed} from "../utils/seeds/MainPostTestSeed";
import request from "supertest";
import express from "express";
import {App} from "../../app";
import {MainPostResponse} from "../../Dtos/MainPost";
import {getTestServer, tearDownTestServer} from "../utils/MockServer";
import {FoodingSeed} from "../utils/seeds/FoodingSeed";

describe("GET /mainPost", () => {
    let app: App;
    let expressApp: express.Application;
    let postRepository: PostRepository;

    beforeAll(async () => {
        app = getTestServer();
        await app.setDatabase();
        await app.initDomain();
        expressApp = app.app;
        postRepository = app.connection.getCustomRepository(PostRepository);
        await postRepository.save(PostSeed);
    });

    beforeEach(async () => {
        await FoodingSeed.setUp(app.connection);
    })

    afterAll(() => {
        tearDownTestServer();
    });

    it("200: 무작위로 3개의 Post를 반환한다 ", async (done) => {
        // given

        // when
        const response = await request(expressApp)
            .get("/mainPost")
            .expect(200);

        // then
        const {body} = response;
        expect(body).toBeArrayOfSize(3);
        for (let post of body) {
            expect(post).toContainAllKeys(Object.getOwnPropertyNames(new MainPostResponse(0, "", "", "")));
        }
        done();
    })
})