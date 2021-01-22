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
import {Location, LocationCategory} from "../domains/Shop/Location";
import {KeywordList} from "../domains/Shop/Keyword";
import {ShopClassification, ShopClassificationEnum} from "../domains/Shop/Classification/ShopClassification";
import {FoodClassification, FoodClassificationEnum} from "../domains/Shop/Classification/FoodClassification";
import {
    IngredientClassification,
    IngredientClassificationEnum
} from "../domains/Shop/Classification/IngredientClassification";
import {BusinessHours} from "../domains/Shop/BusinessHours";
import {Image} from "../domains/Image/Image";
import {Menu} from "../domains/Shop/Menu";


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
    @IsNumber()
    _id: number;
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
        _id: number;
        imageLink: string;
    }[];
    @IsArray()
    menuImage: {
        _id: number;
        imageLink: string;
    }[];
    @IsArray()
    menus: {
        _id: number;
        price: number;
        title: string;
    }[];
    @IsDateString()
    registerDate: string;

    constructor(id: number, name: string, location: Location, businessHours: BusinessHours, contact: string, price: number, scoreAverage: number, didLike: boolean, category: ShopClassification[], detailFoodCategory: FoodClassification[], foodCategory: IngredientClassification[], keyword: { atmosphere: number; costRatio: number; group: number; individual: number; riceAppointment: number }, likerCount: number, mainImage: string, shopImage: Image[] | undefined, menuImage: Image[] | undefined, menus: Menu[], registerDate: Date) {
        this._id = id;
        this.name = name;
        this.address = location.address;
        this.latitude = location.latitude;
        this.longitude = location.longitude;
        this.location = location.locationCategory;
        this.open = businessHours.open;
        this.closed = businessHours.closed;
        this.contact = contact;
        this.price = price;
        this.category = category.map(c => c.shopClassification)[0];
        this.detailFoodCategory = detailFoodCategory.map(c => c.foodClassification);
        this.foodCategory = foodCategory.map(c => c.ingredientClassification);
        this.scoreAverage = scoreAverage;
        this.didLike = didLike;
        this.keyword = keyword;
        this.likerCount = likerCount;
        this.mainImage = mainImage;
        this.shopImage = shopImage ? shopImage.map(i => ({_id: i.id, imageLink: i.imageLink})) : [];
        this.menuImage = menuImage ? menuImage.map(i => ({_id: i.id, imageLink: i.imageLink})) : [];
        this.menus = menus.map(m => ({_id: m.id, price: m.price, title: m.name}));
        this.registerDate = registerDate.toISOString();
    }
}