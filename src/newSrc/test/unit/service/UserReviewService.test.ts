import {Connection} from "typeorm";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {Container} from "typedi";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {UserReviewService} from "../../../Services/UserReviewService";
import {CreatePostDto} from "../../../Dtos/Review";
import {EntityNotExists} from "../../../repositories/Errors/CommonError";
import {ReviewSeed} from "../../utils/seeds/ReviewSeed";
import {ShopSeed} from "../../utils/seeds/ShopSeed";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {ReviewLimitError} from "../../../repositories/Errors/ReviewError";


describe("UserReviewService", () => {

    let db: Connection;
    let domainInitializationService: DomainInitializationService;
    let userShopService: UserReviewService

    beforeAll(async () => {
        db = await createMemoryDatabase();
        domainInitializationService = Container.get(DomainInitializationService);
        userShopService = Container.get(UserReviewService);
    })

    beforeEach(async () => {
        await domainInitializationService.initAllDomain();
        await FoodingSeed.setUp(db);
    });

    afterAll(() => db.close());

    describe("postReview", () => {
        const shopId = ShopSeed[0].id
        const score = 4
        const comment = "댓글"
        const keyword = {costRatio: true, atmosphere: false, group: true, individual: false, riceAppointment: true}

        const user = UserSeed[0]
        const review = ReviewSeed[0]

        it("주어진 가게가 존재하지 않으면 EntityNotExists 에러를 던진다", async () => {
            // given
            const shopId = 98765
            // when
            // then
            await expect(userShopService.postReview(new CreatePostDto(shopId, 1234, score, comment, keyword, new Date()))).rejects.toThrowError(EntityNotExists)
        })

        it("이미 오늘 작성한 댓글이 존재한다면 ReviewLimitError를 던진다", async () => {
            // given

            // when
            // then
            await expect(userShopService.postReview(new CreatePostDto(shopId, user.id, score, comment, keyword, new Date()))).rejects.toThrowError(ReviewLimitError)
        })

        it('만약 이전에 평가한 점수가 존재하지 않는다면 새로운 Score를 만들고 평점을 저장한다', async () => {

        })

        it('이전에 평가한 점수가 존재한다면 그 점수를 덮어씌운다', async () => {

        })

        it('리뷰를 생성한다', async () => {

        })
    })

})