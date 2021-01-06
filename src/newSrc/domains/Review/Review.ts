import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "../Shop/Shop";
import {User} from "../User/User";
import {FoodingBaseEntity} from "../FoodingBaseEntity";

@Entity()
export class Review extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: string;

    @ManyToOne(type => User, user => user.id, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    user: User;

    @ManyToOne(type => Shop, shop => shop.id, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;

    @Column('text', {nullable: false})
    comment: string;
}