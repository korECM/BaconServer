import {EntityRepository} from "typeorm";
import {BaseRepository} from "typeorm-transactional-cls-hooked";
import {Score} from "../domains/Score/Score";
import {EntityNotExists} from "./Errors/CommonError";

@EntityRepository(Score)
export class ScoreRepository extends BaseRepository<Score> {

    async getScoreOfShopByUserId(userId: number, shopId: number) {
        const score = await this.findOne({where: {by: {id: userId}, shop: {id: shopId}}});
        if (!score) throw new EntityNotExists()
        return score
    }

}