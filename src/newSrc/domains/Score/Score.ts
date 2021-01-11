import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "../Shop/Shop";
import {User} from "../User/User";

@Entity()
export class Score {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column('decimal', {precision: 2, scale: 1, nullable: false})
    score: number;
    @ManyToOne(type => Shop, shop => shop.id, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;
    @ManyToOne(type => User, user => user.id, {onUpdate: "CASCADE"})
    by: User
}