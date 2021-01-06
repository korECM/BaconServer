import {Money} from "./Money";
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "./Shop";
import {FoodingBaseEntity} from "../FoodingBaseEntity";

@Entity()
export class Menu extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column('varchar', {length: 50, nullable: false})
    name: string;
    @Column(type => Money, {prefix: false})
    price: Money;
    @ManyToOne(type => Shop, shop => shop.menus, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;
}