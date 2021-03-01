import {Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {UserRepository} from "../repositories/UserRepository";
import {ShopRepository} from "../repositories/Shop/ShopRepository";
import {ReviewRepository} from "../repositories/ReviewRepository";
import {CreatePostDto} from "../Dtos/Review";
import {EntityNotExists, UndefinedError} from "../repositories/Errors/CommonError";
import {ReviewLimitError} from "../repositories/Errors/ReviewError";
import {ScoreRepository} from "../repositories/ScoreRepository";
import {Score} from "../domains/Score/Score";
import {Keyword} from "../domains/Shop/Keyword";


@Service()
export class UserReviewService {
    constructor(@InjectRepository() private userRepository: UserRepository, @InjectRepository() private shopRepository: ShopRepository, @InjectRepository() private reviewRepository: ReviewRepository, @InjectRepository() private scoreRepository: ScoreRepository) {
    }

    async postReview(dto: CreatePostDto) {
        const shop = await this.shopRepository.findOne({id: dto.shopId})
        if (!shop) throw new EntityNotExists({id: dto.shopId})

        // 이미 오늘 작성한 리뷰가 존재한다면
        if (await this.reviewRepository.isExceedReviewLimit(dto.user.id, dto.shopId, new Date())) {
            throw new ReviewLimitError()
        }

        let score: Score
        try {
            // 사용자가 작성했던 점수가 존재한다면 이 점수를 덮어씌운다
            score = await this.scoreRepository.getScoreOfShopByUserId(dto.user.id, dto.shopId);
            score.score = dto.score
            await this.scoreRepository.save(score)
        } catch (e) {
            // 사용자가 작성한 스코어가 존재하지 않는다면 새로 만든다
            if (e instanceof EntityNotExists) {
                score = this.scoreRepository.create({
                    score: dto.score,
                    shop: shop,
                    by: dto.user
                })
            } else {
                throw new UndefinedError(e)
            }
        }
        // 점수 저장
        await this.scoreRepository.save(score)
        // 키워드 증가시키기
        for (const [key, bool] of Object.entries(dto.keywords) as [keyof Keyword, boolean][]) {
            if (bool) shop.keyword[key] += 1
        }
        // 리뷰 생성
        const review = this.reviewRepository.create({
            user: dto.user,
            shop,
            comment: dto.comment
        })
        // 가게, 리뷰 저장
        await Promise.all([
            this.shopRepository.save(shop),
            this.reviewRepository.save(review)
        ])
    }
}
