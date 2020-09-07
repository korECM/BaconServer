import request from 'supertest';
import { app } from '../../index';
import { setupDB } from '../DBTestUtil';
import Shop, { ShopInterface, ShopCategory, FoodCategory } from '../../DB/models/Shop';
import User, { UserInterface } from '../../DB/models/User';
import { ShopController } from '../../DB/controller/Shop/ShopController';
import { UserController } from '../../DB/controller/User/UserController';
import Review, { ReviewSchemaInterface } from '../../DB/models/Review';
import Score from '../../DB/models/Score';
import { generateToken } from '../../lib/jwtMiddleware';
import { ReviewController } from '../../DB/controller/Review/ReviewController';

setupDB();

let shops: ShopInterface[] = [];
let user: UserInterface;
let review: ReviewSchemaInterface;

beforeAll(async () => {
  const firstShopData = {
    name: '화르르',
    address: '서울특별시 동작구 흑석로 111',
    contact: '02-813-3460',
    category: 'korean',
    foodCategory: '닭 / 오리 요리',
    closed: '',
    open: '',
    location: 'front',
  };

  const secondShopData = {
    name: '박군하누',
    address: '서울특별시 동작구 서달로15길 23 1F',
    contact: '02-821-1800',
    category: 'korean',
    foodCategory: '고기 요리',
    closed: '',
    open: '',
    location: 'hs_station',
  };

  let shopController = new ShopController();

  {
    let { address, category, closed, contact, foodCategory, location, name, open } = firstShopData;
    shops.push((await shopController.createShop(name, contact, address, open, closed, 0, 0, 0, location as any, [] as FoodCategory[], category as any))!);
  }
  {
    let { address, category, closed, contact, foodCategory, location, name, open } = secondShopData;

    shops.push((await shopController.createShop(name, contact, address, open, closed, 0, 0, 0, location as any, [] as FoodCategory[], category as any))!);
  }

  user = await User.create({
    email: 'jeffyoun@naver.com',
    kakaoNameSet: true,
    likeShop: [shops[0]._id],
    name: '이름',
    password: '비밀번호',
    gender: 'm',
    provider: 'local',
    isAdmin: false,
    registerDate: new Date(),
    snsId: 'none',
  });

  review = await Review.create({
    comment: '댓글',
    like: [],
    registerDate: new Date(),
    shop: shops[0]._id,
    user: user._id,
  });

  // 가게, 유저당 Score는 원래 하나지만 평균 테스트를 위해
  await Score.create({
    registerDate: new Date(),
    score: 3.5,
    shop: shops[0]._id,
    user: user._id,
  });

  await Score.create({
    registerDate: new Date(),
    score: 2.5,
    shop: shops[0]._id,
    user: user._id,
  });
});

describe('ShopRouter', () => {
  describe('GET /shop', () => {
    it('가게를 배열 형태로 200과 함께 반환', async () => {
      const response = await request(app).get('/shop').expect(200);

      expect(response.body).toBeArray();
    });
  });

  describe('GET /shop/shopId', () => {
    it('적절한 가게 ID가 아니면 400 반환', async () => {
      await request(app).get('/shop/123').expect(400);
    });

    it('적절한 가게 ID 형태지만 일치하는 가게가 없다면 406 반환', async () => {
      await request(app).get('/shop/5f26b992555be6865ede4e25').expect(406);
    });

    describe('일치하는 가게 ID가 있다면', () => {
      it('200 코드로 가게 반환', async () => {
        const response = await request(app)
          .get('/shop/' + shops[0]._id)
          .expect(200);

        expect(response.body).toContainKeys(['_id', 'name', 'contact', 'address', 'category', 'keyword', 'open', 'closed', 'location', 'registerDate']);

        expect(response.body).toContainKeys(['didLike', 'likerCount', 'reviewCount', 'scoreAverage']);
        expect(response.body.likerCount).toBePositive();
        expect(response.body.reviewCount).toBePositive();
        expect(response.body.scoreAverage).toBe(3);
      });
      it('가게에 평점이 없다면 scoreAverage는 null이다', async () => {
        const response = await request(app)
          .get('/shop/' + shops[1]._id)
          .expect(200);

        expect(response.body).toContainKey('scoreAverage');
        expect(response.body.scoreAverage).toBeNull();
      });
      it('로그인 안한 경우 didLike false', async () => {
        const response = await request(app)
          .get('/shop/' + shops[0]._id)
          .expect(200);

        expect(response.body).toContainKey('didLike');
        expect(response.body.didLike).toBeFalse();
      });

      it('로그인 했고 가게 좋아요 했으면 didLike true', async () => {
        const response = await request(app)
          .get('/shop/' + shops[0]._id)
          .set('Cookie', ['access_token=' + generateToken(user)])
          .send()
          .expect(200);

        expect(response.body).toContainKey('didLike');
        expect(response.body.didLike).toBeTrue();
      });
      it('로그인 했고 가게 좋아요 안했으면 didLike false', async () => {
        const response = await request(app)
          .get('/shop/' + shops[1]._id)
          .set('Cookie', ['access_token=' + generateToken(user)])
          .send()
          .expect(200);

        expect(response.body).toContainKey('didLike');
        expect(response.body.didLike).toBeFalse();
      });
    });
  });

  describe('GET /shop/review/:shopId', () => {
    it('적절한 가게 ID가 아니면 400 반환', async () => {
      await request(app).get('/shop/review/123').expect(400);
    });

    it('적절한 가게 ID 형태지만 일치하는 가게가 없다고 해도 200과 빈 배열반환', async () => {
      const response = await request(app).get('/shop/review/5f26b992555be6865ede4e25').expect(200);

      expect(response.body).toBeArray();
      expect(response.body).toBeEmpty();
    });

    it('일치하는 가게가 존재하면 해당 가게의 리뷰를 배열 형태로 반환', async () => {
      const response = await request(app)
        .get('/shop/review/' + shops[0]._id)
        .expect(200);

      expect(response.body).toBeArray();
      (response.body as any[]).forEach((review) => expect(review).toContainKeys(['_id', 'comment', 'registerDate', 'user', 'didLike']));
      (response.body as any[]).forEach((review) => expect(review.user).toBeObject());
      (response.body as any[]).forEach((review) => expect(review.user).toContainKeys(['_id', 'name']));
    });
  });

  describe('POST /shop/review/:shopId', () => {
    it('로그인 안했다면 401 반환', async () => {
      await request(app)
        .post('/shop/review/' + shops[0]._id)
        .send({
          score: 4,
          comment: '댓글',
          keywords: {
            costRatio: true,
            atmosphere: false,
            group: true,
            individual: true,
            riceAppointment: false,
            spicy: true,
          },
        })
        .expect(401);
    });
    it('적절한 가게 ID가 아니면 400 반환', async () => {
      await request(app)
        .post('/shop/review/123')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(400);
    });

    it('적절한 가게 ID 형태지만 일치하는 가게가 없으면 400 반환', async () => {
      const response = await request(app)
        .post('/shop/review/5f26b992555be6865ede4e25')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(400);
    });

    it('score가 0초과 4.5 미만이 아니라면 400 반환', async () => {
      await request(app)
        .post('/shop/review/' + shops[0]._id)
        .set('Cookie', ['access_token=' + generateToken(user)])
        .send({
          score: 0,
          comment: '댓글',
          keywords: {
            costRatio: true,
            atmosphere: false,
            group: true,
            individual: true,
            riceAppointment: false,
            spicy: true,
          },
        })
        .expect(400);

      await request(app)
        .post('/shop/review/' + shops[0]._id)
        .set('Cookie', ['access_token=' + generateToken(user)])
        .send({
          score: 4.51,
          comment: '댓글',
          keywords: {
            costRatio: true,
            atmosphere: false,
            group: true,
            individual: true,
            riceAppointment: false,
            spicy: true,
          },
        })
        .expect(400);
    });
    it('정상적이라면 리뷰를 생성하고 201 반환', async () => {
      await request(app)
        .post('/shop/review/' + shops[0]._id)
        .set('Cookie', ['access_token=' + generateToken(user)])
        .send({
          score: 3,
          comment: '댓글',
          keywords: {
            costRatio: true,
            atmosphere: false,
            group: true,
            individual: true,
            riceAppointment: false,
            spicy: true,
          },
        })
        .expect(201);
    });
  });

  describe('POST /shop/like/:shopId', () => {
    it('로그인 안했다면 401 반환', async () => {
      await request(app)
        .post('/shop/like/' + shops[0]._id)
        .expect(401);
    });
    it('적절한 가게 ID가 아니면 400 반환', async () => {
      await request(app)
        .post('/shop/like/123')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(400);
    });

    it('적절한 가게 ID 형태지만 일치하는 가게가 없으면 406 반환', async () => {
      const response = await request(app)
        .post('/shop/like/5f26b992555be6865ede4e25')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(406);
    });

    it('일치하는 가게가 있다면 likeShop에 해당 가게 추가하고 201 반환', async () => {
      const response = await request(app)
        .post('/shop/like/' + shops[1]._id)
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(201);

      expect((await new UserController().findById(user._id))?.likeShop).toIncludeAnyMembers([shops[1]._id]);
    });
  });

  describe('POST /shop/unlike/:shopId', () => {
    it('로그인 안했다면 401 반환', async () => {
      await request(app)
        .post('/shop/unlike/' + shops[0]._id)
        .expect(401);
    });
    it('적절한 가게 ID가 아니면 400 반환', async () => {
      await request(app)
        .post('/shop/unlike/123')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(400);
    });

    it('적절한 가게 ID 형태지만 일치하는 가게가 없으면 406 반환', async () => {
      const response = await request(app)
        .post('/shop/unlike/5f26b992555be6865ede4e25')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(406);
    });

    it('일치하는 가게가 있다면 likeShop에 해당 가게 제거하고 201 반환', async () => {
      const response = await request(app)
        .post('/shop/unlike/' + shops[1]._id)
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(201);

      expect((await new UserController().findById(user._id))?.likeShop).not.toIncludeAnyMembers([shops[1]._id]);
    });
  });

  describe('POST /shop/like/review/:reviewId', () => {
    it('로그인 안했다면 401 반환', async () => {
      await request(app)
        .post('/shop/like/review/' + review._id)
        .expect(401);
    });
    it('적절한 리뷰 ID가 아니면 400 반환', async () => {
      await request(app)
        .post('/shop/like/review/123')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(400);
    });

    it('적절한 리뷰 ID 형태지만 일치하는 리뷰가 없으면 406 반환', async () => {
      const response = await request(app)
        .post('/shop/like/review/5f26b992555be6865ede4e25')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(406);
    });

    it('일치하는 리뷰가 있다면 like에 해당 유저 추가하고 201 반환', async () => {
      const response = await request(app)
        .post('/shop/like/review/' + review._id)
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(201);

      expect((await new ReviewController().findById(review._id)).like).toIncludeAnyMembers([user._id]);
    });
  });

  describe('POST /shop/unlike/review/:reviewId', () => {
    it('로그인 안했다면 401 반환', async () => {
      await request(app)
        .post('/shop/unlike/review/' + review._id)
        .expect(401);
    });
    it('적절한 가게 ID가 아니면 400 반환', async () => {
      await request(app)
        .post('/shop/unlike/review/123')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(400);
    });

    it('적절한 가게 ID 형태지만 일치하는 가게가 없으면 406 반환', async () => {
      const response = await request(app)
        .post('/shop/unlike/review/5f26b992555be6865ede4e25')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(406);
    });

    it('일치하는 가게가 있다면 like에 해당 유저 제거하고 201 반환', async () => {
      const response = await request(app)
        .post('/shop/unlike/review/' + review._id)
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(201);

      expect((await new ReviewController().findById(review._id)).like).not.toIncludeAnyMembers([user._id]);
    });
  });

  describe('POST /shop/image/:shopId', () => {
    it('로그인 안했다면 401 반환', async () => {
      await request(app)
        .post('/shop/image/' + review._id)
        .expect(401);
    });
    it('적절한 가게 ID가 아니면 400 반환', async () => {
      await request(app)
        .post('/shop/image/123')
        .set('Cookie', ['access_token=' + generateToken(user)])
        .expect(400);
    });
  });
});
