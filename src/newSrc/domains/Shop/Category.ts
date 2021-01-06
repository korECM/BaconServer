import {Column} from "typeorm";

export enum ShopClassification {
    korean = "korean",
    japanese = "japanese",
    western = "western",
    other = "other",
    fusion = "fusion",
    school = "school",
    chinese = "chinese",
}

export enum FoodClassification {
    chicken = "chicken",
    meat = "meat",
    fastfood = "fastfood",
    korean = "korean",
    pig = "pig",
    steamed = "steamed",
    stew = "stew",
    asian = "asian",
    bakery = "bakery",
    chinese = "chinese",
    japanese = "japanese",
    pizza = "pizza",
    school = "school",
    western = "western"
}

export enum IngredientClassification {
    rice = "rice",
    bread = "bread",
    noodle = "noodle",
    meat = "meat",
    etc = "etc"
}

export class Category {
    @Column('varchar', {length: 15, nullable: false})
    shopClassification: ShopClassification;
    @Column('varchar', {length: 15, nullable: false})
    foodClassification: FoodClassification;
    @Column('varchar', {length: 15, nullable: false})
    ingredientClassification: IngredientClassification;
}
