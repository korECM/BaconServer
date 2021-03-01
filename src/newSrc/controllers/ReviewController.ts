import {Authorized, Body, CurrentUser, HttpCode, JsonController, Param, Post} from "routing-controllers";
import {OpenAPI} from "routing-controllers-openapi";
import {UserReviewService} from "../Services/UserReviewService";
import {User} from "../domains/User/User";
import {CreatePostDto, PostReviewRequest} from "../Dtos/Review";

@JsonController("/shop")
export class ReviewController {
    constructor(private userReviewService: UserReviewService) {
    }

    @Post("/:shopId")
    @Authorized()
    @HttpCode(201)
    @OpenAPI({
        description: "리뷰를 작성한다",
        responses: {
            '200': {
                description: "성공 메시지 전달",
            }
        },
    })
    postReview(@Param('shopId') shopId: number, @Body() dto: PostReviewRequest, @CurrentUser() user: User) {
        return this.userReviewService.postReview(new CreatePostDto(shopId, user, dto.score, dto.comment, dto.keywords));
    }
}
