import {Get, JsonController, Param, Res} from "routing-controllers";
import {Response} from "express";
import {logger} from "../utils/logger";
import {OpenAPI} from "routing-controllers-openapi";

@JsonController("")
export class IndexController {

    @Get("")
    @OpenAPI({
        description: "기본 Index에 대한 API로 Hello를 반환한다",
        responses: {
            '201': {
                description: "status 테스트를 위해 그냥 201를 반환한다"
            }
        },
    })
    public test(@Res() res: Response) {
        logger.info("asdf");
        return res.status(201).send("Hello");
    }

    @Get("/:id")
    public idTest(@Param("id") id: string) {
        if (id !== "1") {
            throw new Error("id test : " +  id);
        }
        return id;
    }
}