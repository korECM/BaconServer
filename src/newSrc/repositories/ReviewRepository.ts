import {EntityRepository} from "typeorm";
import {BaseRepository} from "typeorm-transactional-cls-hooked";
import {Review} from "../domains/Review/Review";

@EntityRepository(Review)
export class ReviewRepository extends BaseRepository<Review> {

    async isExceedReviewLimit(userId: number, day: Date) {
        const from = new Date(day)
        from.setHours(0, 0, 0, 0)
        const to = new Date(day)
        to.setHours(24, 0, 0, 0)
        return (await this.createQueryBuilder('review')
            .where('review.user.id = :userId', {userId})
            .andWhere('review.createdTime >= :from', {from: from.toISOString()})
            .andWhere('review.createdTime < :to', {to: to.toISOString()})
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