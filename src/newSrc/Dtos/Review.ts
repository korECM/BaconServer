import {Keyword} from "../domains/Shop/Keyword";
import {
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min
} from "class-validator";
import {User} from "../domains/User/User";

export class PostReviewRequest {
    @IsNotEmpty()
    score: number;
    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment: string;
    @IsNotEmptyObject()
    keywords: { [key in keyof Keyword]: boolean }

    constructor(score: number, comment: string, keywords: { [key in keyof Keyword]: boolean }) {
        this.score = score;
        this.comment = comment;
        this.keywords = keywords;
    }
}

export class CreatePostDto {
    @IsNumber()
    @IsNotEmpty()
    shopId: number;
    @IsObject()
    @IsNotEmpty()
    user: User;
    @IsNotEmpty()
    @Min(1)
    @Max(4.5)
    score: number;
    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment: string;
    @IsNotEmptyObject()
    keywords: { [key in keyof Keyword]: boolean }

    constructor(shopId: number, user: User, score: number, comment: string, keywords: { [key in keyof Keyword]: boolean }) {
        this.shopId = shopId;
        this.user = user;
        this.score = score;
        this.comment = comment;
        this.keywords = keywords;
    }
}
