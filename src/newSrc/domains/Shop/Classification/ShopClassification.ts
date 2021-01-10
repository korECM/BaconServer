import {Entity, PrimaryColumn} from "typeorm";

export enum ShopClassificationEnum {
    korean = "korean",
    japanese = "japanese",
    western = "western",
    other = "other",
    fusion = "fusion",
    school = "school",
    chinese = "chinese",
}


@Entity()
export class ShopClassification {
    @PrimaryColumn()
    shopClassification: ShopClassificationEnum;
}