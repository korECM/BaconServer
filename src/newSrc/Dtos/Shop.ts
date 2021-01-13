import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsLatitude,
    IsLongitude,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsString
} from "class-validator";
import {LocationCategory} from "../domains/Shop/Location";
import {KeywordList} from "../domains/Shop/Keyword";
import {ShopClassification, ShopClassificationEnum} from "../domains/Shop/Classification/ShopClassification";
import {FoodClassification, FoodClassificationEnum} from "../domains/Shop/Classification/FoodClassification";
import {
    IngredientClassification,
    IngredientClassificationEnum
} from "../domains/Shop/Classification/IngredientClassification";


export class GetShopsDto {
    @IsNumber()
    price: number;

    @IsArray()
    location: LocationCategory[];

    @IsArray()
    shopClassification: ShopClassification[];
    @IsArray()
    foodClassification: FoodClassification;
    @IsArray()
    ingredientClassification: IngredientClassification;

    @IsArray()
    keyword: KeywordList[];
}

export class ShopResponse {
    @IsString()
    _id: string;
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    address: string;
    @IsString()
    open: string;
    @IsString()
    closed: string;
    @IsString()
    contact: string;
    @IsNumber()
    price: number;
    @IsString()
    location: LocationCategory;
    @IsNotEmpty()
    category: ShopClassificationEnum;
    @IsNumber()
    scoreAverage: number;
    @IsBoolean()
    didLike: boolean;
    @IsNotEmpty()
    @IsArray()
    detailFoodCategory: FoodClassificationEnum[];
    @IsNotEmpty()
    @IsArray()
    foodCategory: IngredientClassificationEnum[];
    @IsObject()
    keyword: {
        atmosphere: number;
        costRatio: number;
        group: number;
        individual: number;
        riceAppointment: number;
    }
    @IsString()
    @IsLatitude()
    latitude: string;
    @IsString()
    @IsLongitude()
    longitude: string;
    @IsNumber()
    likerCount: number;
    @IsString()
    mainImage: string;
    @IsArray()
    shopImage: {
        _id: string;
        imageLink: string;
    }[];
    @IsArray()
    menuImage: {
        _id: string;
        imageLink: string;
    }[];
    @IsArray()
    menus: {
        _id: string;
        price: number;
        title: string;
    }[];
    @IsDateString()
    registerDate: string;


    // constructor(id: string, name: string, location: Location, businessHours: BusinessHours, contact: string, price: Money, location: LocationCategory, category: ShopClassificationEnum, scoreAverage: number, didLike: boolean, detailFoodCategory: FoodClassificationEnum[], foodCategory: IngredientClassificationEnum[], keyword: { atmosphere: number; costRatio: number; group: number; individual: number; riceAppointment: number }, latitude: string, longitude: string, likerCount: number, mainImage: string, shopImage: Image[], menuImage: Image[], menus: Menu[], registerDate: Date) {
    //     this._id = id;
    //     this.name = name;
    //     this.address = location.address;
    //     this.location = location.locationCategory;
    //     this.latitude = location.latitude;
    //     this.longitude = location.longitude;
    //     this.open = businessHours.open;
    //     this.closed = businessHours.closed;
    //     this.contact = contact;
    //     this.price = price.price;
    //     this.category = category;
    //     this.scoreAverage = scoreAverage;
    //     this.didLike = didLike;
    //     this.detailFoodCategory = detailFoodCategory;
    //     this.foodCategory = foodCategory;
    //     this.keyword = keyword;
    //     this.likerCount = likerCount;
    //     this.mainImage = mainImage;
    //     this.shopImage = shopImage;
    //     this.menuImage = menuImage;
    //     this.menus = menus;
    //     this.registerDate = registerDate.toString();
    // }
}