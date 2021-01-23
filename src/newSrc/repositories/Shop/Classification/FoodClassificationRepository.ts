import {EntityRepository} from "typeorm";
import {FoodClassification} from "../../../domains/Shop/Classification/FoodClassification";
import {BaseRepository} from "typeorm-transactional-cls-hooked";


@EntityRepository(FoodClassification)
export class FoodClassificationRepository extends BaseRepository<FoodClassification> {

}