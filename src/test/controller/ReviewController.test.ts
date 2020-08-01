import { setupDB } from '../DBTestUtil';
import faker from 'faker/locale/ko';
import { ReviewController } from '../../DB/controller/Review/ReviewController';
import { UserController } from '../../DB/controller/User/UserController';
import { UserInterface } from '../../DB/models/User';
import { ShopController } from '../../DB/controller/Shop/ShopController';
import { Location, ShopCategory, ShopInterface } from '../../DB/models/Shop';

setupDB('Review');

describe('ReviewController', () => {
  let user: UserInterface;
  let shop: ShopInterface;
  beforeEach(async () => {
    let userController = new UserController();
    let shopController = new ShopController();
    user = (await userController.createLocalUser(faker.name.findName(), faker.internet.email(), faker.internet.password()))!;
    shop = (await shopController.createShop('식당', '번호', '주소', [], '열음', '닫음', Location.Back, ShopCategory.Korean))!;
  });
  describe('createReview', () => {
    it('score가 0 이하거나 4.5 초과라면 모델을 생성하지 않고 null 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await Promise.all([
        reviewController.createReview(0, user._id, shop._id),
        reviewController.createReview(-2, user._id, shop._id),
        reviewController.createReview(5, user._id, shop._id),
      ]);
      // Assert
      expect(result.every((e) => e === null)).toBeTruthy();
    });

    it('score가 적절하다면 Review를 생성하고 그 Review를 반환', async () => {
      // Arrange
      let reviewController = new ReviewController();
      // Act
      let result = await reviewController.createReview(3.5, user._id, shop._id);
      // Assert
      expect(result).not.toBeNull();
      if (result) {
        expect(result.user).toBe(user._id);
        expect(result.shop).toBe(shop._id);
        expect(result.score).toBe(3.5);
      }
    });
  });
});
