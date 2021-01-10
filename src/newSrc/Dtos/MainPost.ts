import {IsNotEmpty, IsString} from "class-validator";

export class MainPostResponse {
    @IsNotEmpty()
    id: string;
    @IsNotEmpty()
    @IsString()
    title: string;
    @IsNotEmpty()
    @IsString()
    imageLink: string;
    @IsNotEmpty()
    @IsString()
    postLink: string;

    constructor(id: string, title: string, imageLink: string, postLink: string) {
        this.id = id;
        this.title = title;
        this.imageLink = imageLink;
        this.postLink = postLink;
    }
}
