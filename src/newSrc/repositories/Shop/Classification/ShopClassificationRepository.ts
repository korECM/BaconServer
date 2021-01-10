import {EntityRepository, Repository} from "typeorm";
import {ShopClassification} from "../../../domains/Shop/Classification/ShopClassification";


@EntityRepository(ShopClassification)
export class ShopClassificationRepository extends Repository<ShopClassification> {

}