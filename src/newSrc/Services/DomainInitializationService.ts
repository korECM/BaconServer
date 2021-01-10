import {IngredientClassificationRepository} from "../repositories/Shop/Classification/IngredientClassificationRepository";
import {
    IngredientClassification,
    IngredientClassificationEnum
} from "../domains/Shop/Classification/IngredientClassification";
import {Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Repository} from "typeorm";
import {FoodClassification, FoodClassificationEnum} from "../domains/Shop/Classification/FoodClassification";
import {FoodClassificationRepository} from "../repositories/Shop/Classification/FoodClassificationRepository";
import {ShopClassificationRepository} from "../repositories/Shop/Classification/ShopClassificationRepository";
import {ShopClassification, ShopClassificationEnum} from "../domains/Shop/Classification/ShopClassification";

@Service()
export class DomainInitializationService {

    @InjectRepository()
    private ingredientClassificationRepository: IngredientClassificationRepository
    @InjectRepository()
    private foodClassificationRepository: FoodClassificationRepository;
    @InjectRepository()
    private shopClassificationRepository: ShopClassificationRepository;

    async initAllDomain() {
        await Promise.all([
            this.initIngredientClassification(),
            this.initFoodClassification(),
            this.initShopClassification()
        ])
    }

    private async initIngredientClassification() {
        let domainList = Object.keys(IngredientClassificationEnum) as IngredientClassificationEnum[];
        await DomainInitializationService.initDomainValues<IngredientClassification, IngredientClassificationEnum>(domainList, this.ingredientClassificationRepository, value => ({
            ingredientClassification: value
        }))
    }

    private async initFoodClassification() {
        let domainList = Object.keys(FoodClassificationEnum) as FoodClassificationEnum[];
        await DomainInitializationService.initDomainValues<FoodClassification, FoodClassificationEnum>(domainList, this.foodClassificationRepository, value => ({
            foodClassification: value
        }))
    }

    private async initShopClassification() {
        let domainList = Object.keys(ShopClassificationEnum) as ShopClassificationEnum[];
        await DomainInitializationService.initDomainValues<ShopClassification, ShopClassificationEnum>(domainList, this.shopClassificationRepository, value => ({
            shopClassification: value
        }))
    }

    private static async initDomainValues<T, K>(domainList: K[], repository: Repository<T>, entityCallback: (value: K) => T) {
        for (let domain of domainList) {
            let isExist = await repository.findOne(entityCallback(domain))
            if (!isExist) {
                await repository.insert(entityCallback(domain))
            }
        }
    }

}