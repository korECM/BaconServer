import {EntityRepository} from "typeorm";
import {BaseRepository} from "typeorm-transactional-cls-hooked";
import {Review} from "../domains/Review/Review";
import {DateUtil} from "../utils/Date";
import {ReviewNotFoundError} from "./Errors/ReviewError";
import {User} from "../domains/User/User";

@EntityRepository(Review)
export class ReviewRepository extends BaseRepository<Review> {

    async isExceedReviewLimit(userId: number, shopId: number, day: Date) {
        const from = new Date(day)
        from.setHours(0, 0, 0, 0)
        const to = new Date(day)
        to.setHours(23, 59, 59, 0)
        return (await this.createQueryBuilder('review')
            .where('review.user.id = :userId', {userId})
            .andWhere('review.shop.id = :shopId', {shopId})
            .andWhere('review.createdTime >= :from', {from: DateUtil.dateForStringForDatabase(from)})
            .andWhere('review.createdTime < :to', {to: DateUtil.dateForStringForDatabase(to)})
            .getMany()).length > 0
    }

    async getReviewByUser(userId: number): Promise<Review[]> {
        return this.createQueryBuilder('review')
            .where('review.user.id = :userId', {userId})
            .getMany();
    }

    async getReviewByShop(shopId: number): Promise<Review[]> {
        return this.createQueryBuilder('review')
            .where('review.shop.id = :shopId', {shopId})
            .getMany();
    }

    async like(fromUser: User, targetReviewId: number) {
        const review = await this.findOne({where: {id: targetReviewId}, relations: ["likers"]});
        if (!review) {
            throw new ReviewNotFoundError();
        }
        const userId = review.likers.findIndex(liker => liker.id === fromUser.id);
        if (userId === -1) {
            review.likers.push(fromUser);
            await this.save(review);
        }
    }

    async disLike(fromUser: User, targetReviewId: number) {
        const review = await this.findOne({where: {id: targetReviewId}, relations: ["likers"]});
        if (!review) {
            throw new ReviewNotFoundError();
        }
        const userId = review.likers.findIndex(liker => liker.id === fromUser.id);
        if (userId !== -1) {
            review.likers.splice(userId, 1);
            await this.save(review);
        }
    }

}
