import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {FoodingBaseEntity} from "../FoodingBaseEntity";
import {Shop} from "../Shop/Shop";
import {Review} from "../Review/Review";
import {Score} from "../Score/Score";

export enum AuthProvider {
    local = "local",
    kakao = "kakao"
}

export enum Gender {
    m = 'm',
    f = 'f'
}

export enum Role {
    user = 'user',
    admin = 'admin',
}

@Entity()
export class User extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column('varchar', {length: 21, nullable: false})
    name: string;
    @Column("varchar", {nullable: false})
    email: string;

    @Column('varchar', {length: 10, nullable: false})
    provider: AuthProvider;
    @Column()
    kakaoNameSet: boolean;
    @Column('varchar', {length: 1, nullable: false})
    gender: Gender;
    @Column('varchar', {nullable: true, length: 30})
    snsId: string | null;
    @Column('varchar', {nullable: true, length: 70})
    password: string | null;
    @Column('varchar', {length: 10, nullable: false})
    role: Role;

    @ManyToMany(type => Shop, shop => shop.likers, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinTable()
    likeShops: Shop[]

    @OneToMany(type => Review, review => review.shop)
    reviews: Review[]

    @OneToMany(type => Score, score => score.by)
    scores: Score[]

}