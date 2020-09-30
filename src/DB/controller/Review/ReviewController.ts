import Review, { ReviewInterface, ReviewSchemaInterface } from '../../models/Review';
import { ShopController } from '../Shop/ShopController';

import mongoose from 'mongoose';
import Score from '../../models/Score';
import Keyword from '../../models/Keyword';
import ReviewReport, { ReviewReportState } from '../../models/ReviewReport';
import Shop from '../../models/Shop';

const ObjectId = mongoose.Types.ObjectId;

interface TempKeyword {
  costRatio: boolean;
  atmosphere: boolean;
  group: boolean;
  individual: boolean;
  riceAppointment: boolean;
  spicy: boolean;
}

export interface ReportOption {
  comment: string;
  userId: string;
}

export class ReviewController {
  constructor() {}

  async createReview(score: number, user: string, shop: string, comment: string, keywords: TempKeyword) {
    if (score <= 0 || score > 4.5) return null;
    try {
      let shopController = new ShopController();
      let targetShop = await shopController.findById(shop);

      if (!targetShop) return null;

      let scoreModel = await Score.findOne({ user, shop });
      if (!scoreModel) {
        scoreModel = new Score();
        scoreModel.user = user;
        scoreModel.shop = shop;
      }
      scoreModel.score = score;

      await scoreModel.save();

      let keyword = await Keyword.findById(targetShop.keyword);
      if (!keyword) return null;

      for (const [key, value] of Object.entries(keywords)) {
        if (value) (keyword as any)[key] += 1;
      }

      await keyword.save();

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

  async deleteReview(reviewId: string) {
    try {
      let review = await Review.findById(reviewId);
      if (!review) return false;

      let shop = await Shop.findById(review.shop);
      if (!shop) return false;

      let anotherReview = await Review.find({ user: review.user });
      // 만약 작성자가 남긴 유일한 리뷰를 지우는거라면
      if (anotherReview.length === 1) {
        let score = await Score.findOne({ user: review.user });
        if (!score) return false;

        await score.remove();
      }

      await review.remove();
      return true;
    } catch (error) {
      console.error(error);
      return false;
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
        $addFields: {
          likeNum: {
            $size: '$like',
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
            kakaoNameSet: 0,
          },
        },
      },
      {
        $sort: {
          likeNum: -1,
          registerDate: -1,
        },
      },
    ]);

    return reviews as ReviewInterface[];
  }

  async existsReviewOnToday(userId: string, shopId: string) {
    let today = new Date();
    let review = await Review.findOne({
      user: userId,
      shop: shopId,
      registerDate: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      },
    });
    console.log(review);
    console.log(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    return review !== null;
  }

  async getMyReview(userId: string) {
    let reviews = await Review.aggregate([
      {
        $match: {
          user: {
            $eq: ObjectId(userId),
          },
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
        $addFields: {
          likeNum: {
            $size: '$like',
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
            kakaoNameSet: 0,
          },
        },
      },
      {
        $sort: {
          likeNum: -1,
          registerDate: -1,
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

  async setReportState(reportId: string, state: string) {
    try {
      let report = await ReviewReport.findById(reportId);
      if (!report) return false;

      if (state === 'done') {
        report.state = ReviewReportState.Done;
      } else if (state === 'reject') {
        report.state = ReviewReportState.Rejected;
      }

      await report.save();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getReviewReport() {
    try {
      let report = await ReviewReport.find()
        .where('state')
        .nin([ReviewReportState.Done, ReviewReportState.Rejected])
        .populate('userId')
        .populate('reviewId')
        .populate({
          path: 'reviewId',
          populate: { path: 'user', select: 'name' },
        });

      report = report.map((r) => {
        (r.userId as any).password = null;
        return r;
      });

      return report;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async addReport(reviewId: string, data: ReportOption) {
    try {
      let review = (await this.findById(reviewId)) as ReviewSchemaInterface;
      if (!review) return false;

      await ReviewReport.create({
        comment: data.comment,
        registerDate: new Date(),
        reviewId,
        userId: data.userId,
        state: ReviewReportState.Issued,
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
