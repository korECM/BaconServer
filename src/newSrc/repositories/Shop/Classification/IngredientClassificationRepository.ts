import {IngredientClassification} from "../../../domains/Shop/Classification/IngredientClassification";
import {EntityRepository, Repository} from "typeorm";

@EntityRepository(IngredientClassification)
export class IngredientClassificationRepository extends Repository<IngredientClassification> {
    
}