import {Connection} from "typeorm";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {PostRepository} from "../../../repositories/PostRepository";
import {MainPostService} from "../../../Services/MainPostService";
import {PostSeed} from "../../utils/seeds/MainPostTestSeed";


describe("MainPostService", () => {
    let db: Connection;
    let postRepository: PostRepository;
    let mainPostService: MainPostService;

    beforeAll(async () => {
        db = await createMemoryDatabase();
        postRepository = db.getCustomRepository(PostRepository);
        await postRepository.save(PostSeed);
        mainPostService = new MainPostService(postRepository);
    });

    afterAll(() => db.close());

    it("최근 Post 3개를 반환한다", async () => {
        // given
        let expectedLength = 3;
        // when
        let actualPosts = await mainPostService.getMainPosts();

        // then
        expect(actualPosts).toBeArrayOfSize(expectedLength);
    })
})