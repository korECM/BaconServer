import {Connection, Repository} from "typeorm";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {Container} from "typedi";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {UserRepository} from "../../../repositories/UserRepository";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {ReviewRepository} from "../../../repositories/ReviewRepository";
import {ShopSeed} from "../../utils/seeds/ShopSeed";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {User} from "../../../domains/User/User";
import {ReviewNotFoundError} from "../../../repositories/Errors/ReviewError";

describe("UserRepository", () => {
    let db: Connection;
    let reviewRepository: ReviewRepository;
    let userRepository: Repository<User>;

    let domainInitializationService: DomainInitializationService;

    beforeAll(async () => {
        db = await createMemoryDatabase();
        domainInitializationService = Container.get(DomainInitializationService);
        userRepository = db.getRepository(User);
        reviewRepository = db.getCustomRepository(ReviewRepository);
    })

    beforeEach(async () => {
        await domainInitializationService.initAllDomain();
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

    describe("like", () => {
        it("만약 해당 리뷰가 존재하지 않는다면 ReviewNotFoundError를 던진다", async () => {
            // given
            const reviewId = 123123;
            const user = await userRepository.findOne({id: UserSeed[0].id});
            // when

            // then
            await expect(reviewRepository.like(user!, reviewId)).rejects.toBeInstanceOf(ReviewNotFoundError);
        })
        it("review의 likers에 해당 User를 추가한다", async () => {
            // given
            const review = (await reviewRepository.find({relations: ["likers"]}))[0];
            const user = await userRepository.findOne({where: {id: UserSeed[2].id}});
            // when
            await reviewRepository.like(user!, review.id);
            // then
            expect(review.likers).toHaveLength(0);
            const resultReview = await reviewRepository.findOne({where: {id: review.id}, relations: ["likers"]});
            expect(resultReview!.likers).toHaveLength(1);
            expect(resultReview!.likers.map(user => user.id)).toContain(user!.id);
        })
        it("이미 좋아요를 누른 User의 경우 또 추가하지는 않는다", async () => {
            // given
            const review = (await reviewRepository.find({relations: ["likers"]}))[0];
            const user = await userRepository.findOne({where: {id: UserSeed[2].id}});
            await reviewRepository.like(user!, review.id);
            // when
            // 한번 더 좋아요
            await reviewRepository.like(user!, review.id);
            // then
            const resultReview = await reviewRepository.findOne({where: {id: review.id}, relations: ["likers"]});
            expect(resultReview!.likers).toHaveLength(1);
            expect(resultReview!.likers.map(user => user.id)).toContain(user!.id);
        })
    })

    describe("dislike", () => {
        it("만약 해당 리뷰가 존재하지 않는다면 ReviewNotFoundError를 던진다", async () => {
            // given
            const reviewId = 123123;
            const user = await userRepository.findOne({id: UserSeed[0].id});
            // when

            // then
            await expect(reviewRepository.disLike(user!, reviewId)).rejects.toBeInstanceOf(ReviewNotFoundError);
        })
        it("review의 likers에 해당 User를 삭제한다", async () => {
            const review = (await reviewRepository.find({relations: ["likers"]}))[0];
            const user = await userRepository.findOne({where: {id: UserSeed[2].id}});

            expect(review.likers).toHaveLength(0);

            await reviewRepository.like(user!, review.id);
            expect((await reviewRepository.findOne({
                where: {id: review.id},
                relations: ["likers"]
            }))?.likers).toHaveLength(1);

            await reviewRepository.disLike(user!, review.id);
            const resultReview = await reviewRepository.findOne({where: {id: review.id}, relations: ["likers"]});
            expect(resultReview!.likers).toHaveLength(0);
            expect(resultReview!.likers.map(user => user.id)).not.toContain(user!.id);
        })
    })
})
