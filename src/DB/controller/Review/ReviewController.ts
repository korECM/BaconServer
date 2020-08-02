import Review, { ReviewInterface, ReviewSchemaInterface } from '../../models/Review';
import { Schema } from 'mongoose';
import { ShopController } from '../Shop/ShopController';

export class ReviewController {
  constructor() {}

  async createReview(score: number, user: string, shop: string, comment: string) {
    if (score <= 0 || score > 4.5) return null;
    try {
      let shopController = new ShopController();
      let targetShop = await shopController.findById(shop);

      if (!targetShop) return null;

      let review = new Review({
        user,
        shop,
        comment,
        like: [],
        score,
      });

      await review.save();

      targetShop.reviews.push(review._id);
      await targetShop.save();

      return review as ReviewInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findById(id: string) {
    return (await Review.findById(id)) as ReviewInterface;
  }

  async likeReview(userId: string, reviewId: string) {
    try {
      let review = (await this.findById(reviewId)) as ReviewSchemaInterface;
      if (!review) return false;

      if ((review.like as string[]).includes(userId) === false) {
        (review.like as string[]).push(userId);
        await review.save();
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async unlikeReview(userId: string, reviewId: string) {
    try {
      let review = (await this.findById(reviewId)) as ReviewSchemaInterface;
      if (!review) return false;

      if ((review.like as string[]).includes(userId) === true) {
        review.like = (review.like as string[]).filter((liker) => `${liker}` !== `${userId}`);
        await review.save();
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
