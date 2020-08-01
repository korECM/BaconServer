import express from 'express';
import Joi from 'joi';
import { isInvalid } from './validate';
import { ShopService, ShopOrder } from '../service/ShopService';
import { Location } from '../DB/models/Shop';
import { isValidObjectId } from 'mongoose';
import { ReviewController } from '../DB/controller/Review/ReviewController';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { order } = req.query;
  const location = req.query.location ? (req.query.location as string).split(',') : undefined;
  const category = req.query.category ? (req.query.category as string).split(',') : undefined;

  let shopService = new ShopService();

  let shops = await shopService.getShops({ category: category as any, location: location as any, order: order as any });

  res.status(200).json(shops);
});

router.post('/review/:shopId', async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (!shopId || shopId.length === 0) return res.status(404).send();
  if (isValidObjectId(shopId) === false) return res.status(404).send();
  const { score } = req.body;
  if (!score || isNaN(Number(score))) return res.status(404).send();

  if (!req.user) return res.status(401).send();

  let reviewController = new ReviewController();
  try {
    let result = await reviewController.createReview(score, req.user._id, shopId);
    if (result === null) return res.status(400).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }

  return res.status(201).send();
});

export default router;
