import express from 'express';
import Joi from 'joi';
import { isValidObjectId } from 'mongoose';
import { ReviewController } from '../DB/controller/Review/ReviewController';
import { upload } from '../lib/upload';
import { ShopController } from '../DB/controller/Shop/ShopController';
import { UserService } from '../service/UserService';
import { isLogin } from '../lib/userMiddleware';
import { reqValidate } from '../lib/JoiValidate';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { order } = req.query;
  const location = req.query.location ? (req.query.location as string).split(',') : undefined;
  const category = req.query.category ? (req.query.category as string).split(',') : undefined;
  const price = req.query.price ? (req.query.price as string) : undefined;

  let shopController = new ShopController();

  let shops = await shopController.getShops({ category: category as any, location: location as any, order: order as any, price: price as any });

  res.status(200).json(shops);
});

router.get('/:shopId', async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let shopController = new ShopController();

  let shop = await shopController.getShop(shopId, req.user?._id);

  if (shop === null) return res.status(406).send();

  return res.status(200).json(shop);
});

router.get('/review/:shopId', async (req, res, next) => {
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
  isLogin,
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
      return res.status(301).send({
        message: 'success',
      });
    } else {
      return res.status(406).send();
    }
  },
);

router.post(
  '/report/:shopId',
  isLogin,
  reqValidate(
    Joi.object({
      type: Joi.array().items(Joi.number()),
      comment: Joi.string().optional().max(200),
    }),
    'body',
  ),
  async (req, res, next) => {
    const shopId = req.params.shopId as string;
    if (isValidObjectId(shopId) === false) return res.status(400).send();

    let type = req.body.type as number[];
    let comment = req.body.comment as string;

    if (type.some((t) => t < 0 || t > 5)) return res.status(400).send();

    let shopController = new ShopController();
    if (
      await shopController.addReport(shopId, {
        comment,
        type,
        userId: req.user!._id,
      })
    ) {
      return res.status(301).send({
        message: 'success',
      });
    } else {
      return res.status(406).send();
    }
  },
);

router.post(
  '/review/report/:reviewId',
  isLogin,
  reqValidate(
    Joi.object({
      comment: Joi.number().optional().max(200),
    }),
    'body',
  ),
  async (req, res, next) => {
    const reviewId = req.params.reviewId as string;
    if (isValidObjectId(reviewId) === false) return res.status(400).send();

    let comment = req.body.comment as string;

    let reviewController = new ReviewController();
    if (
      await reviewController.addReport(reviewId, {
        comment,
        userId: req.user!._id,
      })
    ) {
      return res.status(301).send({
        message: 'success',
      });
    } else {
      return res.status(406).send();
    }
  },
);

router.post('/image/:shopId', isLogin, upload.array('imgFile', 5), async (req, res, next) => {
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

router.post('/menuImage/:shopId', isLogin, upload.array('imgFile', 3), async (req, res, next) => {
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

export default router;
