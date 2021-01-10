import {Entity, PrimaryColumn} from "typeorm";


export enum FoodClassificationEnum {
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

@Entity()
export class FoodClassification {
    @PrimaryColumn()
    foodClassification: FoodClassificationEnum;
}