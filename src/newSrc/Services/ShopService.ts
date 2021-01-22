import {Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {ShopRepository} from "../repositories/Shop/ShopRepository";
import {ShopResponse} from "../Dtos/Shop";

@Service()
export class ShopService {
    constructor(@InjectRepository() private shopRepository: ShopRepository) {
    }

    async getShop(shopId: number, userId: number | null) {
        const shop = await this.shopRepository.getShop(shopId, userId)

        return new ShopResponse(
            shop.id,
            shop.name,
            shop.location,
            shop.businessHours,
            shop.contact,
            shop.price,
            shop.scoreAverage,
            shop.didLike,
            shop.shopClassification,
            shop.foodClassification,
            shop.ingredientClassification,
            shop.keyword,
            shop.likers.length,
            shop.mainImage,
            shop.shopImages,
            shop.menuImages,
            shop.menus,
            shop.createdTime
        )
    }

}