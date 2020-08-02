import Review, { ReviewInterface } from '../../models/Review';
import Shop from '../../models/Shop';
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
}
