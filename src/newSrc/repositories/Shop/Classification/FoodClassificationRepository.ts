import {EntityRepository, Repository} from "typeorm";
import {FoodClassification} from "../../../domains/Shop/Classification/FoodClassification";


@EntityRepository(FoodClassification)
export class FoodClassificationRepository extends Repository<FoodClassification> {

}