import {EntityRepository} from "typeorm";
import {BaseRepository} from "typeorm-transactional-cls-hooked";
import {Review} from "../domains/Review/Review";
import {DateUtil} from "../utils/Date";

@EntityRepository(Review)
export class ReviewRepository extends BaseRepository<Review> {

    async isExceedReviewLimit(userId: number, day: Date) {
        const from = new Date(day)
        from.setHours(0, 0, 0, 0)
        const to = new Date(day)
        to.setHours(23, 59, 59, 0)
        return (await this.createQueryBuilder('review')
            .where('review.user.id = :userId', {userId})
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

}