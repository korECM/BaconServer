import { setupDB } from '../DBTestUtil';
import faker from 'faker/locale/ko';
import mongoose, { Schema } from 'mongoose';
import { ReviewController } from '../../DB/controller/Review/ReviewController';
import { UserController } from '../../DB/controller/User/UserController';
import { UserInterface } from '../../DB/models/User';
import { ShopController } from '../../DB/controller/Shop/ShopController';
import { Location, ShopCategory, ShopInterface } from '../../DB/models/Shop';
import { Mongoose } from 'mongoose';
import { ReviewInterface } from '../../DB/models/Review';

setupDB('Review');

describe('ReviewController', () => {
  let user: UserInterface;
  let shop: ShopInterface;
  let review: ReviewInterface;
  beforeEach(async () => {
    let userController = new UserController();
    let shopController = new ShopController();
    let reviewController = new ReviewController();
    user = (await userController.createLocalUser(faker.name.findName(), faker.internet.email(), faker.internet.password()))!;
    shop = (await shopController.createShop('식당', '번호', '주소', [], '열음', '닫음', Location.Back, ShopCategory.Korean))!;
    review = (await reviewController.createReview(3, user._id, shop._id, '댓글'))!;
  });
  describe('createReview', () => {
    it('score가 0 이하거나 4.5 초과라면 모델을 생성하지 않고 null 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await Promise.all([
        reviewController.createReview(0, user._id, shop._id, ''),
        reviewController.createReview(-2, user._id, shop._id, ''),
        reviewController.createReview(5, user._id, shop._id, ''),
      ]);
      // Assert
      expect(result.every((e) => e === null)).toBeTruthy();
    });

    it('shopId가 존재하지 않는다면 null을 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await reviewController.createReview(3.5, user._id, new mongoose.mongo.ObjectId().toHexString(), '');
      // Assert
      expect(result).toBeNull();
    });

    it('score가 적절하다면 Review를 생성하고 그 Review를 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await reviewController.createReview(3.5, user._id, shop._id, '내용');
      // Assert
      expect(result).not.toBeNull();
      if (result) {
        expect(result.user).toBe(user._id);
        expect(result.shop).toBe(shop._id);
        expect(result.score).toBe(3.5);
        expect(result.comment).toBe('내용');
      }
    });
  });

  describe('findById', () => {
    it('해당 Review가 존재하면 해당 Review 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await reviewController.findById(review._id);
      // Assert
      expect(result).not.toBeNull();
    });

    it('해당 Review가 없으면 null 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await reviewController.findById(new mongoose.Types.ObjectId().toHexString());
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('likeReview', () => {
    it('해당 리뷰가 존재하지 않으면 false 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await reviewController.likeReview(user._id, new mongoose.Types.ObjectId().toHexString());
      // Assert
      expect(result).toBeFalsy();
    });

    it('해당 리뷰가 존재하면 like에 userId 추가하고 true 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await reviewController.likeReview(user._id, review._id);
      let changedReview = await reviewController.findById(review._id);
      // Assert
      expect(result).toBeTruthy();
      expect(changedReview!.like.includes(user._id)).toBeTruthy();
    });
  });

  describe('unlikeReview', () => {
    it('해당 리뷰가 존재하지 않으면 false 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await reviewController.unlikeReview(user._id, new mongoose.Types.ObjectId().toHexString());
      // Assert
      expect(result).toBeFalsy();
    });

    it('해당 리뷰가 존재하면 like에 userId 추가하고 true 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      await reviewController.likeReview(user._id, review._id);
      let result = await reviewController.unlikeReview(user._id, review._id);
      let changedReview = await reviewController.findById(review._id);
      // Assert
      expect(result).toBeTruthy();
      expect(changedReview!.like.includes(user._id)).toBeFalsy();
    });
  });
});
