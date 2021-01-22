import {Get, HttpCode, JsonController, Param} from "routing-controllers";
import {OpenAPI, ResponseSchema} from "routing-controllers-openapi";
import {MainPostResponse} from "../Dtos/MainPost";
import {ShopService} from "../Services/ShopService";

@JsonController("/shop")
export class ShopController {
    constructor(private shopService: ShopService) {
    }

    @Get("/:shopId")
    @HttpCode(200)
    @ResponseSchema(MainPostResponse)
    @OpenAPI({
        description: "전달받은 shopId와 일치하는 가게를 반환한다",
        responses: {
            '200': {
                description: "Shop 객체가 담긴 배열을 반환한다",
            }
        },
    })
    getShop(@Param('shopId') shopId: number) {
        let userId = 1;
        return this.shopService.getShop(shopId, userId);
    }
}