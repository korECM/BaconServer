import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "./Shop";
import {FoodingBaseEntity} from "../FoodingBaseEntity";
import {IsPositive, Length} from "class-validator";

@Entity()
export class Menu extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column('varchar', {length: 50, nullable: false})
    @Length(1, 50)
    name: string;
    @Column({nullable: false})
    @IsPositive()
    price: number;
    @ManyToOne(type => Shop, shop => shop.menus, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;
}