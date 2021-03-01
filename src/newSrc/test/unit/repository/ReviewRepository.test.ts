import {Connection} from "typeorm";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {Container} from "typedi";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {UserRepository} from "../../../repositories/UserRepository";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {ReviewRepository} from "../../../repositories/ReviewRepository";
import {ShopSeed} from "../../utils/seeds/ShopSeed";
import {createMemoryDatabase} from "../../utils/setupDatabase";

describe("UserRepository", () => {
    let db: Connection;
    let reviewRepository: ReviewRepository;

    let domainInitializationService: DomainInitializationService;

    beforeAll(async () => {
        db = await createMemoryDatabase();
        domainInitializationService = Container.get(DomainInitializationService);
    })

    beforeEach(async () => {
        await domainInitializationService.initAllDomain();
        reviewRepository = db.getCustomRepository(ReviewRepository);
        await FoodingSeed.setUp(db);
    });

    afterAll(() => db.close());

    describe("isExceedReviewLimit", () => {
        const now = new Date(2010, 2, 20, 15, 0, 0);
        let shopId: number
        beforeEach(async () => {
            const review = (await reviewRepository.find({relations: ["shop"]}))[0]
            shopId = review.shop.id
            await reviewRepository.update(review.id, {createdTime: now});
        })
        it("오늘 작성한 리뷰가 존재하면 true 반환", async () => {
            // given
            const user = UserSeed[0]
            const date = new Date(2010, 2, 20, 13, 0, 0);
            // when
            const result = await reviewRepository.isExceedReviewLimit(user.id, shopId, date)

            // then
            expect(result).toBeTrue();
        })
        it("오늘 작성한 리뷰가 존재하지 않으면 false 반환", async () => {
            // given
            const user = UserSeed[0]
            const date1 = new Date(2010, 2, 21, 0, 0, 0);
            const date2 = new Date(2010, 2, 19, 23, 59, 59);
            // when
            const result1 = await reviewRepository.isExceedReviewLimit(user.id, shopId, date1)
            const result2 = await reviewRepository.isExceedReviewLimit(user.id, shopId, date2)

            // then
            expect(result1).toBeFalse();
            expect(result2).toBeFalse();
        })
        it("가게가 다르면 오늘 작성한 리뷰가 있어도 false 반환", async () => {
            // given
            const user = UserSeed[0]
            const date = new Date(2010, 2, 20, 13, 0, 0);
            // when
            const result = await reviewRepository.isExceedReviewLimit(user.id, shopId + 100, date);

            // then
            expect(result).toBeFalse();
        })
    })

    describe('getReviewsByUser', () => {
        it('만약 해당 유저의 리뷰가 존재하지 않는다면 빈 배열을 반환한다', async () => {
            // given
            const userId = 123123
            // when
            const result = await reviewRepository.getReviewByUser(userId)
            // then
            expect(result).toBeArrayOfSize(0)
        })

        it('해당 유저의 리뷰 배열을 반환한다', async () => {
            // given
            const user = UserSeed[0]
            // when
            const result = await reviewRepository.getReviewByUser(user.id)
            // then
            expect(result).toBeArray()
        })
    })

    describe('getReviewByShop', () => {
        it('만약 해당 유저의 리뷰가 존재하지 않는다면 빈 배열을 반환한다', async () => {
            // given
            const shopId = 123123
            // when
            const result = await reviewRepository.getReviewByShop(shopId)
            // then
            expect(result).toBeArrayOfSize(0)
        })

        it('해당 유저의 리뷰 배열을 반환한다', async () => {
            // given
            const shop = ShopSeed[0]
            // when
            const result = await reviewRepository.getReviewByShop(shop.id)
            // then
            expect(result).toBeArray()
        })
    })
})
