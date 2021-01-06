import {Entity, ManyToOne} from "typeorm";
import {BaseReport} from "./BaseReport";
import {Shop} from "../Shop/Shop";

@Entity()
export class ShopReport extends BaseReport {
    @ManyToOne(type => Shop, shop => shop.reports, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop
}