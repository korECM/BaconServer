import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {BusinessHours} from "./BusinessHours";
import {Money} from "./Money";
import {Keyword} from "./Keyword";
import {Location} from "./Location";
import {Category} from "./Category";
import {Menu} from "./Menu";
import {Image} from "../Image/Image";
import {Review} from "../Review/Review";
import {FoodingBaseEntity} from "../FoodingBaseEntity";
import {User} from "../User/User";
import {Score} from "../Score/Score";
import {ShopReport} from "../Report/ShopReport";

@Entity()
export class Shop extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: string;

    @Column({length: 50, type: "varchar", nullable: false})
    name: string;
    @Column({length: 20, type: "varchar", nullable: false})
    contact: string;
    @Column({length: 150, type: "varchar"})
    mainImage: string;

    @Column(type => BusinessHours, {prefix: false})
    businessHours: BusinessHours;

    @Column("bigint", {default: 0, nullable: false})
    viewCount: number;

    @Column(type => Money, {prefix: false})
    price: Money;

    @Column(type => Category, {prefix: false})
    category: Category;
    //
    @Column(type => Location, {prefix: false})
    location: Location;
    //
    @Column(type => Keyword, {prefix: false})
    keyword: Keyword;

    @OneToMany(type => Menu, Menu => Menu.id)
    menus: [Menu];

//
//     @OneToMany(type => Image, image => image.shop)
    shopImages?: [Image];
//
//     @OneToMany(type => Image, image => image.shop)
    menuImages?: [Image];
//
    @OneToMany(type => Review, review => review.id)
    reviews: [Review];

    @ManyToMany(type => User, user => user.likeShop, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    likers: [User]

    @OneToMany(type => Score, score => score.shop)
    scores: [Score]

    @OneToMany(type => ShopReport, report => report.shop)
    reports: [ShopReport]

}