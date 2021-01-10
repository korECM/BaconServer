import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {FoodingBaseEntity} from "../FoodingBaseEntity";

@Entity()
export class Post extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column('varchar', {length: 75, nullable: false})
    title: string;
    @Column('varchar', {length: 200, nullable: false})
    imageLink: string;
    @Column('varchar', {length: 200, nullable: false})
    postLink: string;
}