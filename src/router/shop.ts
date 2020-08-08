import express from 'express';
import Joi from 'joi';
import { isInvalid } from './validate';
import { ShopService, ShopOrder } from '../service/ShopService';
import { Location } from '../DB/models/Shop';
import { isValidObjectId } from 'mongoose';
import { ReviewController } from '../DB/controller/Review/ReviewController';
import { upload } from '../lib/upload';
import { ShopController } from '../DB/controller/Shop/ShopController';
import { UserService } from '../service/UserService';
import { isLogin } from '../lib/userMiddleware';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { order } = req.query;
  const location = req.query.location ? (req.query.location as string).split(',') : undefined;
  const category = req.query.category ? (req.query.category as string).split(',') : undefined;
  const price = req.query.price ? (req.query.price as string) : undefined;

  let shopService = new ShopService();

  let shops = await shopService.getShops({ category: category as any, location: location as any, order: order as any, price: price as any }, true);

  res.status(200).json(shops);
});

router.get('/:shopId', async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let shopController = new ShopController();

  let shop = await shopController.getShop(shopId, req.user?._id);

  if (shop === null) return res.status(404).send();

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

router.post('/review/:shopId', isLogin, async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();
  const { score, comment, keywords } = req.body;
  if (!score || isNaN(Number(score))) return res.status(400).send();

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

router.post('/image/:shopId', isLogin, upload.array('imgFile', 5), async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let shopController = new ShopController();

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

export default router;
