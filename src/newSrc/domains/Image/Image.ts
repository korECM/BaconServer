import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "../Shop/Shop";
import {FoodingBaseEntity} from "../FoodingBaseEntity";

export enum ImageType {
    shop = "shop",
    menu = "menu",
}

@Entity()
export class Image extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: string;
    @Column({nullable: false})
    imageLink: string;
    @Column('varchar', {length: 10, nullable: false})
    type: ImageType;

    @ManyToOne(type => Shop, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;
}
