import express from 'express';
import Joi from 'joi';
import { isInvalid } from './validate';
import { ShopService, ShopOrder } from '../service/ShopService';
import { Location } from '../DB/models/Shop';
import { isValidObjectId } from 'mongoose';
import { ReviewController } from '../DB/controller/Review/ReviewController';
import { upload } from '../lib/upload';
import { ShopController } from '../DB/controller/Shop/ShopController';
import { UserController } from '../DB/controller/User/UserController';
import { UserService } from '../service/UserService';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { order } = req.query;
  const location = req.query.location ? (req.query.location as string).split(',') : undefined;
  const category = req.query.category ? (req.query.category as string).split(',') : undefined;

  let shopService = new ShopService();

  let shops = await shopService.getShops({ category: category as any, location: location as any, order: order as any }, true);

  res.status(200).json(shops);
});

router.get('/review/:shopId', async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (!shopId || shopId.length === 0) return res.status(400).send();
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.getReviewsForShop(shopId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/review/:shopId', async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (!shopId || shopId.length === 0) return res.status(400).send();
  if (isValidObjectId(shopId) === false) return res.status(400).send();
  const { score, comment } = req.body;
  if (!score || isNaN(Number(score))) return res.status(400).send();
  if (!comment || comment.length === 0) return res.status(400).send();

  if (!req.user) return res.status(401).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.createReview(score, req.user._id, shopId, comment);
    if (result === null) return res.status(400).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }

  return res.status(201).send();
});

router.post('/like/:shopId', async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (!shopId || shopId.length === 0) return res.status(400).send();
  if (isValidObjectId(shopId) === false) return res.status(400).send();

  if (!req.user) return res.status(401).send();

  let userService = new UserService();
  try {
    let result = await userService.addLikeShop(req.user._id, shopId);
    if (result == false) return res.status(404).send();

    return res.status(201).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/like/review/:reviewId', async (req, res, next) => {
  const reviewId = req.params.reviewId as string;
  if (!reviewId || reviewId.length === 0) return res.status(400).send();
  if (isValidObjectId(reviewId) === false) return res.status(400).send();

  if (!req.user) return res.status(401).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.likeReview(req.user._id, reviewId);
    if (result == false) return res.status(404).send();

    return res.status(201).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/unlike/review/:reviewId', async (req, res, next) => {
  const reviewId = req.params.reviewId as string;
  if (!reviewId || reviewId.length === 0) return res.status(400).send();
  if (isValidObjectId(reviewId) === false) return res.status(400).send();

  if (!req.user) return res.status(401).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.unlikeReview(req.user._id, reviewId);
    if (result == false) return res.status(404).send();

    return res.status(201).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/image/:shopId', upload.array('imgFile', 5), async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (!shopId || shopId.length === 0) return res.status(400).send();
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
