import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Shop} from "../Shop/Shop";
import {User} from "../User/User";
import {IsNumber, Max, Min} from "class-validator";

@Entity()
export class Score {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column('decimal', {precision: 2, scale: 1, nullable: false})
    @Min(1)
    @Max(4.5)
    @IsNumber()
    score: number;
    @ManyToOne(type => Shop, shop => shop.id, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    shop: Shop;
    @ManyToOne(type => User, user => user.id, {onUpdate: "CASCADE"})
    by: User
}