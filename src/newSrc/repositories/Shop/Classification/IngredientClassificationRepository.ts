import {IngredientClassification} from "../../../domains/Shop/Classification/IngredientClassification";
import {EntityRepository} from "typeorm";
import {BaseRepository} from "typeorm-transactional-cls-hooked";

@EntityRepository(IngredientClassification)
export class IngredientClassificationRepository extends BaseRepository<IngredientClassification> {

}