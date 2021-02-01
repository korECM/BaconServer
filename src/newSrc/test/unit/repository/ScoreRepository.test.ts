import {Connection} from "typeorm";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {Container} from "typedi";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {UserRepository} from "../../../repositories/UserRepository";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {ScoreRepository} from "../../../repositories/ScoreRepository";
import {ScoreSeed} from "../../utils/seeds/ScoreSeed";
import {ShopSeed} from "../../utils/seeds/ShopSeed";
import {EntityNotExists} from "../../../repositories/Errors/CommonError";

describe("UserRepository", () => {
    let db: Connection;
    let scoreRepository: ScoreRepository;

    let domainInitializationService: DomainInitializationService;

    beforeAll(async () => {
        db = await createMemoryDatabase();
        domainInitializationService = Container.get(DomainInitializationService);
    })

    beforeEach(async () => {
        await domainInitializationService.initAllDomain();
        scoreRepository = db.getCustomRepository(ScoreRepository);
        await FoodingSeed.setUp(db);
    });

    afterAll(() => db.close());

    describe("getScoreOfShopByUserId", () => {

        it("해당 유저가 작성한 가게의 점수 존재하면 Score 반환", async () => {
            // given
            const score = ScoreSeed[0]
            const user = UserSeed[0]
            const shop = ShopSeed[0]
            // when
            const result = await scoreRepository.getScoreOfShopByUserId(user.id, shop.id)

            // then
            expect(result).not.toBeUndefined()
            expect(result).not.toBeNull()
            expect(result).toMatchObject(score);
        })

        it("해당 유저가 작성한 가게의 점수 존재하지 않으면 EntityNotExists 던진다", async () => {
            // given
            const user = UserSeed[2]
            const shop = ShopSeed[0]
            // when
            // then
            await expect(scoreRepository.getScoreOfShopByUserId(user.id, shop.id)).rejects.toThrowError(EntityNotExists)
        })

    })

})