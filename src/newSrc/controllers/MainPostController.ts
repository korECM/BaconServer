import {Get, HttpCode, JsonController} from "routing-controllers";
import {MainPostService} from "../Services/MainPostService";
import {OpenAPI, ResponseSchema} from "routing-controllers-openapi";
import {MainPostResponse} from "../Dtos/MainPost";

@JsonController("/mainPost")
export class MainPostController {
    constructor(private mainPostService: MainPostService) {
    }

    @Get("/")
    @HttpCode(200)
    @ResponseSchema(MainPostResponse)
    @OpenAPI({
        description: "무작위로 3개의 MainPost 객체를 반환한다",
        responses: {
            '200': {
                description: "MainPost 객체가 담긴 배열을 반환한다",
            }
        },
    })
    getMainPosts() {
        return this.mainPostService.getMainPosts();
    }
}