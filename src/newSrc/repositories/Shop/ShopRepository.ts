import {EntityRepository} from "typeorm";
import {Shop} from "../../domains/Shop/Shop";
import {BaseRepository} from "typeorm-transactional-cls-hooked";
import {EntityNotExists} from "../Errors/CommonError";

export enum GetShopsOrder {
    recommended = 'recommended',
    rate = 'rate',
    review = 'review',
}

@EntityRepository(Shop)
export class ShopRepository extends BaseRepository<Shop> {
    async getShops() {
        return this.createQueryBuilder('shop')
            .getMany();
    }

    async searchShopsByName(name: string) {
        return this.createQueryBuilder("shop")
            .leftJoinAndSelect("shop.menus", "menus")
            .where("shop.name LIKE :name", {name: `%${name}%`})
            .orWhere("menus.name LIKE :name", {name: `%${name}%`})
            .getMany();
    }

    async getShop(shopId: number, userId: number | null): Promise<Shop> {
        let {entities, raw} = await this.createQueryBuilder("shop")
            .leftJoinAndSelect("shop.shopClassification", "shopClassification")
            .leftJoinAndSelect("shop.foodClassification", "foodClassification")
            .leftJoinAndSelect("shop.ingredientClassification", "ingredientClassification")
            .leftJoinAndSelect("shop.menus", "menus")
            .leftJoinAndSelect("shop.likers", "likers")
            .leftJoinAndSelect("shop.scores", "scores")
            .leftJoinAndMapMany("shop.shopImages", "shop.images", "shopImages", "shopImages.type = :type", {type: "shop"})
            .leftJoinAndMapMany("shop.menuImages", "shop.images", "menuImages", "menuImages.type = :type", {type: "menu"})
            .addSelect(subQuery => {
                return subQuery
                    .select("COUNT(*)")
                    .from(Shop, "shop")
                    .innerJoin("shop.likers", "likers", "likers.id = :userId", {userId})
                    .where("shop.id = :shopId", {shopId})
            }, "givenUserLikeCount")
            .addSelect(subQuery => {
                return subQuery
                    .select("AVG(scores.score)")
                    .from(Shop, "shop")
                    .leftJoin("shop.scores", "scores")
                    .where("shop.id = :shopId", {shopId})
            }, "scoreAverageRaw")
            .where("shop.id = :shopId", {shopId})
            .getRawAndEntities();
        if (entities.length === 0)
            throw new EntityNotExists({id: shopId});
        let [shop, rawData] = [entities[0], raw[0]];

        return this.create({
            ...shop,
            didLike: rawData.givenUserLikeCount > 0,
            scoreAverage: rawData.scoreAverageRaw
        })

    }
}