import Review, { ReviewInterface, ReviewSchemaInterface } from '../../models/Review';
import { Schema } from 'mongoose';
import { ShopController } from '../Shop/ShopController';
import User from '../../models/User';

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

      return review as ReviewInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getReviewsForShop(shopId: string) {
    let reviews = await Review.find({ shop: shopId });

    // reviews 안에 있는 userId Join
    await User.populate(reviews, { path: 'user', select: '_id name email' });
    return reviews as ReviewInterface[];
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
