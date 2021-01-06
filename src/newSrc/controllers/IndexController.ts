import {Get, HttpCode, JsonController, Res} from "routing-controllers";
import {Response} from "express";
import {OpenAPI} from "routing-controllers-openapi";

@JsonController("")
export class IndexController {

    @Get("")
    @HttpCode(200)
    @OpenAPI({
        description: "기본 Index에 대한 API로 Hello를 반환한다",
        responses: {
            '200': {
                description: "status 테스트를 위해 그냥 201를 반환한다"
            }
        },
    })
    public test(@Res() res: Response) {
        return res.status(200).send("Hello");
    }
}