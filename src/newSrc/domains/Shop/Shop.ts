import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {BusinessHours} from "./BusinessHours";
import {Money} from "./Money";
import {Keyword} from "./Keyword";
import {Location} from "./Location";
import {Menu} from "./Menu";
import {Image} from "../Image/Image";
import {Review} from "../Review/Review";
import {FoodingBaseEntity} from "../FoodingBaseEntity";
import {User} from "../User/User";
import {Score} from "../Score/Score";
import {ShopReport} from "../Report/ShopReport";
import {ShopClassification} from "./Classification/ShopClassification";
import {FoodClassification} from "./Classification/FoodClassification";
import {IngredientClassification} from "./Classification/IngredientClassification";

@Entity()
export class Shop extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

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

    @ManyToMany(type => ShopClassification, c => c.shopClassification, {nullable: false})
    @JoinTable()
    shopClassification: ShopClassification[];
    @ManyToMany(type => FoodClassification, c => c.foodClassification, {nullable: false})
    @JoinTable()
    foodClassification: FoodClassification[];
    @ManyToMany(type => IngredientClassification, c => c.ingredientClassification, {nullable: false})
    @JoinTable()
    ingredientClassification: IngredientClassification[];

    @Column(type => Location, {prefix: false})
    location: Location;
    @Column(type => Keyword, {prefix: false})
    keyword: Keyword;

    @OneToMany(type => Menu, Menu => Menu.shop)
    menus: Menu[];

    @OneToMany(type => Image, image => image.shop)
    images: Image[];

    shopImages?: Image[];

    menuImages?: Image[];

    @OneToMany(type => Review, review => review.shop)
    reviews: Review[];

    @ManyToMany(type => User, user => user.likeShops, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    likers: User[]

    didLike: boolean

    @OneToMany(type => Score, score => score.shop)
    scores: Score[]

    @OneToMany(type => ShopReport, report => report.shop)
    reports: ShopReport[]

}