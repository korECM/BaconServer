import {Connection} from "typeorm";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {PostRepository} from "../../../repositories/PostRepository";
import {PostSeed} from "../../utils/seeds/MainPostTestSeed";
import {Post} from "../../../domains/Post/Post";


describe("PostRepository", () => {
    let db: Connection;
    let postRepository: PostRepository;

    beforeAll(async () => {
        db = await createMemoryDatabase();
        postRepository = db.getCustomRepository(PostRepository);
        await postRepository.save(PostSeed);
    });

    afterAll(() => db.close());

    it("getRecentPosts는 num 개수만큼의 최신 Post를 가져온다", async () => {
        // given
        let postNum = 3;
        let expectedPosts: Post[] = postRepository.create(PostSeed.reverse().slice(0, postNum));

        // when
        let actualPosts: Post[] = await postRepository.getRecentPosts(postNum);

        // then
        expect(actualPosts).toEqual(expectedPosts);
    })

    it("getRandomPosts는 num 개수만큼의 무작위로 Post를 가져온다", async () => {
        // given
        let postNum = 3;
        let randomCount = 10;
        let actualPostIds: (number[])[] = []

        // when
        for (let i = 0; i < randomCount; i++) {
            actualPostIds.push((await postRepository.getRandomPosts(postNum)).map(post => post.id));
        }

        // then
        let postIdSet = new Set(actualPostIds.map(post => JSON.stringify(post)));
        let expectedPostIds: (string[])[] = Array.from(postIdSet).map(post => JSON.parse(post));
        expect(expectedPostIds.length).not.toBe(1);
    })
})