import {Connection} from "typeorm";
import {PostRepository} from "../../repositories/PostRepository";
import {createMemoryDatabase} from "../utils/setupDatabase";
import {PostSeed} from "../utils/seeds/MainPostTestSeed";
import request from "supertest";
import express from "express";
import {App} from "../../app";
import {MainPostResponse} from "../../Dtos/MainPost";
import {getTestServer, tearDownTestServer} from "../utils/MockServer";

describe("GET /mainPost", () => {
    let db: Connection;
    let postRepository: PostRepository;
    let app: App;
    let expressApp: express.Application;

    beforeAll(async () => {
        db = await createMemoryDatabase();
        postRepository = db.getCustomRepository(PostRepository);
        await postRepository.save(PostSeed);
        app = getTestServer();
        expressApp = app.app;
    });

    afterAll(() => {
        db.close();
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
            expect(post).toContainAllKeys(Object.getOwnPropertyNames(new MainPostResponse("", "", "", "")));
        }
        done();
    })
})