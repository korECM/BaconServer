import {Connection, Repository} from "typeorm";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {Container} from "typedi";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {UserReviewService} from "../../../Services/UserReviewService";
import {CreatePostDto} from "../../../Dtos/Review";
import {EntityNotExists} from "../../../repositories/Errors/CommonError";
import {ReviewSeed} from "../../utils/seeds/ReviewSeed";
import {ShopSeed} from "../../utils/seeds/ShopSeed";
import {ReviewLimitError} from "../../../repositories/Errors/ReviewError";
import {User} from "../../../domains/User/User";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {Review} from "../../../domains/Review/Review";
import {Shop} from "../../../domains/Shop/Shop";
import {Score} from "../../../domains/Score/Score";


describe("UserReviewService", () => {

    let db: Connection;
    let domainInitializationService: DomainInitializationService;
    let userReviewService: UserReviewService
    let userRepository: Repository<User>
    let reviewRepository: Repository<Review>
    let shopRepository: Repository<Shop>
    let scoreRepository: Repository<Score>
    let user: User

    beforeAll(async () => {
        db = await createMemoryDatabase();
        domainInitializationService = Container.get(DomainInitializationService);
        userReviewService = Container.get(UserReviewService);
        userRepository = db.getRepository(User)
        reviewRepository = db.getRepository(Review);
        shopRepository = db.getRepository(Shop);
        scoreRepository = db.getRepository(Score);
    })

    beforeEach(async () => {
        await domainInitializationService.initAllDomain();
        await FoodingSeed.setUp(db);
        user = (await userRepository.findOne({id: UserSeed[0].id}))!
    });

    afterAll(() => db.close());

    describe("postReview", () => {
        const shopId = ShopSeed[0].id
        const score = 4
        const comment = "댓글"
        const keyword = {costRatio: true, atmosphere: false, group: true, individual: false, riceAppointment: true}

        const review = ReviewSeed[0]

        it("주어진 가게가 존재하지 않으면 EntityNotExists 에러를 던진다", async () => {
            // given
            const shopId = 98765
            // when
            // then
            await expect(userReviewService.postReview(new CreatePostDto(shopId, user, score, comment, keyword))).rejects.toThrowError(EntityNotExists)
        })

        it("이미 오늘 작성한 댓글이 존재한다면 ReviewLimitError를 던진다", async () => {
            // given
            const noReviewShopId = ShopSeed[3].id
            const noReviewShop = await shopRepository.findOne({id: noReviewShopId});
            await reviewRepository.save(reviewRepository.create({
                user,
                comment: "댓글 내용",
                shop: noReviewShop!
            }))
            // when
            // then
            await expect(userReviewService.postReview(new CreatePostDto(noReviewShopId, user, score, comment, keyword))).rejects.toThrowError(ReviewLimitError)
        })

        it('만약 이전에 평가한 점수가 존재하지 않는다면 새로운 Score를 만들고 평점을 저장한다', async () => {
            // given
            const noScoreShopId = ShopSeed[3].id;
            const noScoreShop = await shopRepository.findOne({id: noScoreShopId});
            // when
            // then
            expect(await scoreRepository.find({shop: noScoreShop, by: user})).toHaveLength(0);
            await userReviewService.postReview(new CreatePostDto(noScoreShopId, user, score, comment, keyword));
            expect(await scoreRepository.find({shop: noScoreShop, by: user})).toHaveLength(1);
        })

        it('이전에 평가한 점수가 존재한다면 그 점수를 덮어씌운다', async () => {
            // given
            const scoreShopId = ShopSeed[0].id;
            const scoreShop = await shopRepository.findOne({id: scoreShopId});
            // 리뷰 개수 초과 막기위해서 날짜 조작
            const orgReview = await reviewRepository.findOne({shop: scoreShop, user});
            await reviewRepository.update(orgReview!.id, {createdTime: new Date(2020, 1, 1)});
            // when
            // 이전에 존재하던 Score
            const beforeScore = await scoreRepository.find({shop: scoreShop, by: user});
            // 리뷰 작성
            await userReviewService.postReview(new CreatePostDto(scoreShopId, user, score, comment, keyword));
            // then
            expect(beforeScore).toHaveLength(1);
            const resultScore = await scoreRepository.find({shop: scoreShop, by: user})
            expect(resultScore).toHaveLength(1);
            expect(resultScore[0].id).toBe(beforeScore[0].id);
            expect(resultScore[0].score).toBe(score);
        })

        it('리뷰를 생성한다', async () => {
            // given
            const noReviewShopId = ShopSeed[3].id
            const noReviewShop = await shopRepository.findOne({id: noReviewShopId});
            // when
            await userReviewService.postReview(new CreatePostDto(noReviewShopId, user, score, comment, keyword));
            // then
            const reviews = await reviewRepository.find({where: {user, shop: noReviewShop}, relations: ["user"]});
            expect(reviews).toHaveLength(1);
            expect(reviews[0].comment).toBe(comment);
            expect(reviews[0].user.id).toBe(user.id);
        })
    })

})
