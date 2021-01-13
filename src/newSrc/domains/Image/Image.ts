import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "../Shop/Shop";
import {FoodingBaseEntity} from "../FoodingBaseEntity";
import {User} from "../User/User";

export enum ImageType {
    shop = "shop",
    menu = "menu",
}

@Entity()
export class Image extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column({nullable: false})
    imageLink: string;
    @Column('varchar', {length: 10, nullable: false})
    type: ImageType;

    @ManyToOne(type => Shop, shop => shop.images, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;

    @ManyToOne(type => User, user => user.images, {onUpdate: "CASCADE"})
    by: User;
}
