import {Entity, PrimaryColumn} from "typeorm";


export enum IngredientClassificationEnum {
    rice = "rice",
    bread = "bread",
    noodle = "noodle",
    meat = "meat",
    etc = "etc"
}

@Entity()
export class IngredientClassification {
    @PrimaryColumn()
    ingredientClassification: IngredientClassificationEnum;
}