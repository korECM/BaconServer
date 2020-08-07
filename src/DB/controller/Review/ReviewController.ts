import Review, { ReviewInterface, ReviewSchemaInterface } from '../../models/Review';
import { ShopController } from '../Shop/ShopController';

import mongoose from 'mongoose';
import Score from '../../models/Score';

const ObjectId = mongoose.Types.ObjectId;

interface TempKeyword {
  costRatio: boolean;
  atmosphere: boolean;
  group: boolean;
  individual: boolean;
  riceAppointment: boolean;
  spicy: boolean;
}

export class ReviewController {
  constructor() {}

  async createReview(score: number, user: string, shop: string, comment: string, keywords: TempKeyword) {
    if (score <= 0 || score > 4.5) return null;
    try {
      let shopController = new ShopController();
      let targetShop = await shopController.findById(shop);

      if (!targetShop) return null;

      let scoreModel = await Score.findOne({ user });
      if (!scoreModel) {
        scoreModel = new Score();
        scoreModel.user = user;
        scoreModel.shop = shop;
      }
      scoreModel.score = score;

      for (const [key, value] of Object.entries(keywords)) {
        if (value) (scoreModel as any)[key] += 1;
      }

      await scoreModel.save();

      let review = new Review({
        user,
        shop,
        comment,
        like: [],
      });

      await review.save();

      return review as ReviewInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getReviewsForShop(shopId: string, userId?: string) {
    let reviews = await Review.aggregate([
      {
        $match: {
          shop: ObjectId(shopId),
        },
      },
      {
        $addFields: {
          didLike: {
            $in: [ObjectId(userId), '$like'],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $project: {
          like: 0,
          shop: 0,
          __v: 0,
          user: {
            __v: 0,
            password: 0,
            snsId: 0,
            provider: 0,
            email: 0,
            likeShop: 0,
            registerDate: 0,
          },
        },
      },
    ]);

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
