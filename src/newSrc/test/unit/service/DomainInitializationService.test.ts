import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {Connection} from "typeorm";
import {IngredientClassificationRepository} from "../../../repositories/Shop/Classification/IngredientClassificationRepository";
import {FoodClassificationRepository} from "../../../repositories/Shop/Classification/FoodClassificationRepository";
import {ShopClassificationRepository} from "../../../repositories/Shop/Classification/ShopClassificationRepository";
import {Container} from "typedi";
import {FoodClassificationEnum} from "../../../domains/Shop/Classification/FoodClassification";
import {IngredientClassificationEnum} from "../../../domains/Shop/Classification/IngredientClassification";
import {ShopClassificationEnum} from "../../../domains/Shop/Classification/ShopClassification";

describe("DomainInitializationService", () => {

    let service: DomainInitializationService;
    let db: Connection;
    let ingredientClassificationRepository: IngredientClassificationRepository
    let foodClassificationRepository: FoodClassificationRepository;
    let shopClassificationRepository: ShopClassificationRepository;

    beforeEach(async () => {
        db = await createMemoryDatabase();
        service = Container.get(DomainInitializationService);
        ingredientClassificationRepository = db.getCustomRepository(IngredientClassificationRepository);
        foodClassificationRepository = db.getCustomRepository(FoodClassificationRepository);
        shopClassificationRepository = db.getCustomRepository(ShopClassificationRepository);
    })

    it("Domain에 필요한 모든 값들을 넣는다", async () => {
        // given

        // when
        await service.initAllDomain();

        // then
        let food = (await foodClassificationRepository.find({})).map(domain => domain.foodClassification);
        expect(food).toContainAllValues(Object.keys(FoodClassificationEnum));
        let ingredient = (await ingredientClassificationRepository.find({})).map(domain => domain.ingredientClassification);
        expect(ingredient).toContainAllValues(Object.keys(IngredientClassificationEnum));
        let shop = (await shopClassificationRepository.find({})).map(domain => domain.shopClassification);
        expect(shop).toContainAllValues(Object.keys(ShopClassificationEnum));
    })

})