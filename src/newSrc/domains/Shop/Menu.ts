import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "./Shop";
import {FoodingBaseEntity} from "../FoodingBaseEntity";

@Entity()
export class Menu extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column('varchar', {length: 50, nullable: false})
    name: string;
    @Column({nullable: false})
    price: number;
    @ManyToOne(type => Shop, shop => shop.menus, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;
}