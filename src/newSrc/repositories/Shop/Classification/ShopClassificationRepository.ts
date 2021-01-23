import {EntityRepository} from "typeorm";
import {ShopClassification} from "../../../domains/Shop/Classification/ShopClassification";
import {BaseRepository} from "typeorm-transactional-cls-hooked";


@EntityRepository(ShopClassification)
export class ShopClassificationRepository extends BaseRepository<ShopClassification> {

}