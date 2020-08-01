import Review, { ReviewInterface } from '../../models/Review';

export class ReviewController {
  constructor() {}

  async createReview(score: number, user: string, shop: string) {
    if (score <= 0 || score > 4.5) return null;
    try {
      let review = new Review({
        user,
        shop,
        score,
      });

      await review.save();

      return review as ReviewInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
