import {EntityRepository, Repository} from "typeorm";
import {Shop} from "../../domains/Shop/Shop";

export enum GetShopsOrder {
    recommended = 'recommended',
    rate = 'rate',
    review = 'review',
}

export class ShopDoesNotFoundError extends Error {
    public message: string;

    constructor(private shopId: number) {
        super();
        this.message = `shopId(${shopId})와 일치하는 가게가 존재하지 않습니다`;
    }
}

@EntityRepository(Shop)
export class ShopRepository extends Repository<Shop> {
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
        // console.log(
        //     this.createQueryBuilder("shop")
        //         .where("shop.id = :shopId", {shopId})
        //         .leftJoinAndSelect("shop.shopClassification", "shopClassification")
        //         .leftJoinAndSelect("shop.foodClassification", "foodClassification")
        //         .leftJoinAndSelect("shop.ingredientClassification", "ingredientClassification")
        //         .leftJoinAndSelect("shop.menus", "menus")
        //         .leftJoinAndMapMany("shop.shopImages", "shop.images", "shopImages", "shopImages.type = :type", {type: "shop"})
        //         .leftJoinAndMapMany("shop.menuImages", "shop.images", "menuImages", "menuImages.type = :type", {type: "menu"})
        //         .getSql()
        // )

        const likerAb = await this.createQueryBuilder("shop")
            .from(Shop, "shop")
            .innerJoin("shop.likers", "likers")
            .where("shop.id = :shopId", {shopId})

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
            throw new ShopDoesNotFoundError(shopId);
        let [shop, rawData] = [entities[0], raw[0]];

        return {
            ...shop,
            didLike: rawData.givenUserLikeCount > 0,
            scoreAverage: rawData.scoreAverageRaw
        }

    }
}