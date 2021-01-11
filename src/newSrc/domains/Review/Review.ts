import {Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "../Shop/Shop";
import {User} from "../User/User";
import {FoodingBaseEntity} from "../FoodingBaseEntity";

@Entity()
export class Review extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(type => User, user => user.id, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    user: User;

    @ManyToOne(type => Shop, shop => shop.id, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;

    @ManyToMany(type => User, user => user.likeReviews)
    @JoinTable()
    likers: User[];

    @Column('text', {nullable: false})
    comment: string;
}