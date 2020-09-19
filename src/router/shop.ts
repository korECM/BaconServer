import express from 'express';
import Joi from 'joi';
import { isValidObjectId } from 'mongoose';
import { ReviewController } from '../DB/controller/Review/ReviewController';
import { upload } from '../lib/image';
import { ShopController } from '../DB/controller/Shop/ShopController';
import { UserService } from '../service/UserService';
import { isLogin, isAdmin } from '../lib/userMiddleware';
import { reqValidate } from '../lib/JoiValidate';
import apiCache from 'apicache';

const router = express.Router();

const cache = apiCache.middleware;

router.get('/', cache('3 minutes'), async (req, res, next) => {
  const { order } = req.query;
  const location = req.query.location ? (req.query.location as string).split(',') : undefined;
  const category = req.query.category ? (req.query.category as string).split(',') : undefined;
  const foodCategory = req.query.foodCategory ? (req.query.foodCategory as string).split(',') : undefined;
  const keyword = req.query.keyword ? (req.query.keyword as string).split(',') : undefined;
  const price = req.query.price ? (req.query.price as string).split(',') : undefined;
  const name = req.query.name ? (req.query.name as string) : undefined;

  let shopController = new ShopController();

  let shops = await shopController.getShops({
    category: category as any,
    location: location as any,
    order: order as any,
    price: price as any,
    keyword: keyword as any,
    name,
    foodCategory: foodCategory as any,
  });

  res.status(200).json(shops);
});

router.get('/myShop', isLogin, cache('1 minutes'), async (req, res, next) => {
  let shopController = new ShopController();

  let shops = await shopController.getMyShop(req.user!._id);

  res.status(200).json(shops);
});

router.get('/myReview', isLogin, cache('1 minutes'), async (req, res, next) => {
  let reviewController = new ReviewController();

  let reviews = await reviewController.getMyReview(req.user!._id);

  res.status(200).json(reviews);
});

router.put('/:shopId', isAdmin, async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let shopController = new ShopController();

  let shops = await shopController.editShop(shopId, req.body);

  res.status(201).json(shops);
});

router.get('/:shopId', cache('5 seconds'), async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let shopController = new ShopController();

  let shop = await shopController.getShop(shopId, req.user?._id);

  if (shop === null) return res.status(406).send();

  return res.status(200).json(shop);
});

router.get('/review/checkToday/:shopId', isLogin, async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.existsReviewOnToday(req.user!._id, shopId);
    // 오늘 작성한 리뷰가 없다면
    if (result === false) {
      return res.status(200).json({
        message: 'success',
      });
    } else {
      return res.status(401).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(401).send();
  }
});

router.get('/review/:shopId', cache('5 seconds'), async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.getReviewsForShop(shopId, req.user?._id);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post(
  '/review/:shopId',
  isLogin,
  reqValidate(
    Joi.object({
      score: Joi.number().required(),
      comment: Joi.optional(),
      keywords: Joi.object().required(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const shopId = req.params.shopId as string;
    if (isValidObjectId(shopId) === false) return res.status(400).send();
    const { score, comment, keywords } = req.body;
    // if (!score || isNaN(Number(score))) return res.status(400).send();

    let reviewController = new ReviewController();
    try {
      let isExisted = await reviewController.existsReviewOnToday(req.user!._id, shopId);
      if (isExisted) return res.status(401).send();
      let result = await reviewController.createReview(score, req.user!._id, shopId, comment, keywords);
      if (result === null) return res.status(400).send();

      return res.status(201).json({
        message: 'success',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send();
    }
  },
);

router.delete('/review/:reviewId', isLogin, async (req, res, next) => {
  const reviewId = req.params.reviewId as string;
  if (isValidObjectId(reviewId) === false) return res.status(400).send();

  let reviewController = new ReviewController();
  try {
    let review = await reviewController.findById(reviewId);
    if (req.user?._id === review._id || req.user?.isAdmin) {
      let result = await reviewController.deleteReview(reviewId);
      if (result === false) return res.status(400).send();

      return res.status(201).json({
        message: 'success',
      });
    } else {
      return res.status(400).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/like/:shopId', isLogin, async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let userService = new UserService();
  try {
    let result = await userService.addLikeShop(req.user!._id, shopId);
    if (result == false) return res.status(406).send();

    return res.status(201).json({
      message: 'success',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/unlike/:shopId', isLogin, async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let userService = new UserService();
  try {
    let result = await userService.unlikeShop(req.user!._id, shopId);
    if (result == false) return res.status(406).send();

    return res.status(201).json({
      message: 'success',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/like/review/:reviewId', isLogin, async (req, res, next) => {
  const reviewId = req.params.reviewId as string;
  if (isValidObjectId(reviewId) === false) return res.status(400).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.likeReview(req.user!._id, reviewId);
    if (result == false) return res.status(406).send();

    return res.status(201).json({
      message: 'success',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/unlike/review/:reviewId', isLogin, async (req, res, next) => {
  const reviewId = req.params.reviewId as string;
  if (isValidObjectId(reviewId) === false) return res.status(400).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.unlikeReview(req.user!._id, reviewId);
    if (result == false) return res.status(406).send();

    return res.status(201).json({
      message: 'success',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post(
  '/menu/:shopId',
  isAdmin,
  reqValidate(
    Joi.object({
      title: Joi.string().required(),
      price: Joi.number().required(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const shopId = req.params.shopId as string;
    if (isValidObjectId(shopId) === false) return res.status(400).send();

    let title = req.body.title as string;
    let price = req.body.price as number;

    let shopController = new ShopController();
    if (await shopController.addMenu(shopId, title, price)) {
      return res.status(201).send({
        message: 'success',
      });
    } else {
      return res.status(406).send();
    }
  },
);

router.put(
  '/menu/:menuId',
  isAdmin,
  reqValidate(
    Joi.object({
      title: Joi.string().required(),
      price: Joi.number().required(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const menuId = req.params.menuId as string;
    if (isValidObjectId(menuId) === false) return res.status(400).send();

    let title = req.body.title as string;
    let price = req.body.price as number;

    let shopController = new ShopController();
    if (await shopController.editMenu(menuId, title, price)) {
      return res.status(200).send({
        message: 'success',
      });
    } else {
      return res.status(406).send();
    }
  },
);

router.delete('/menu/:menuId', isAdmin, async (req, res, next) => {
  const menuId = req.params.menuId as string;
  if (isValidObjectId(menuId) === false) return res.status(400).send();

  let title = req.body.title as string;
  let price = req.body.price as number;

  let shopController = new ShopController();
  if (await shopController.deleteMenu(menuId)) {
    return res.status(200).send({
      message: 'success',
    });
  } else {
    return res.status(406).send();
  }
});

router.post(
  '/mainImage/:shopId',
  isLogin,
  reqValidate(
    Joi.object({
      imageLink: Joi.string().required(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const shopId = req.params.shopId as string;
    if (isValidObjectId(shopId) === false) return res.status(400).send();

    let imageLink = req.body.imageLink as string;

    let shopController = new ShopController();

    if (await shopController.setMainImage(shopId, imageLink)) {
      return res.status(201).send({
        message: 'success',
      });
    } else {
      return res.status(406).send();
    }
  },
);

router.post('/image/:shopId', isLogin, upload.array('imgFile', 10), async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let shopController = new ShopController();

  if (!req.files)
    return res.status(504).send({
      error: 'Fail To Upload',
    });

  const locations = (req.files as Express.MulterS3.File[]).map((file) => file.location);

  if (await shopController.addImage(shopId, locations)) {
    res.status(201).send({
      locations,
    });
  } else {
    res.status(504).send({
      error: 'Fail To Upload',
    });
  }
});

router.post('/menuImage/:shopId', isLogin, upload.array('imgFile', 10), async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let shopController = new ShopController();

  if (!req.files)
    return res.status(504).send({
      error: 'Fail To Upload',
    });

  const locations = (req.files as Express.MulterS3.File[]).map((file) => file.location);

  if (await shopController.addMenuImage(shopId, locations)) {
    res.status(201).send({
      locations,
    });
  } else {
    res.status(504).send({
      error: 'Fail To Upload',
    });
  }
});

router.delete('/shopImage/:imageId', isAdmin, async (req, res, next) => {
  const imageId = req.params.imageId as string;
  if (isValidObjectId(imageId) === false) return res.status(400).send();

  let shopController = new ShopController();

  if (await shopController.deleteShopImage(imageId)) {
    res.status(201).send();
  } else {
    res.status(504).send({
      error: 'Fail To Upload',
    });
  }
});

router.delete('/menuImage/:imageId', isAdmin, async (req, res, next) => {
  const imageId = req.params.imageId as string;
  if (isValidObjectId(imageId) === false) return res.status(400).send();

  let shopController = new ShopController();

  if (await shopController.deleteMenuImage(imageId)) {
    res.status(201).send();
  } else {
    res.status(504).send({
      error: 'Fail To Upload',
    });
  }
});

export default router;
