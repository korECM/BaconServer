import express from 'express';
import Joi from 'joi';
import { isInvalid } from './validate';
import { ShopService, ShopOrder } from '../service/ShopService';
import { Location } from '../DB/models/Shop';
import { isValidObjectId } from 'mongoose';
import { ReviewController } from '../DB/controller/Review/ReviewController';
import { upload } from '../lib/upload';
import { ShopController } from '../DB/controller/Shop/ShopController';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { order } = req.query;
  const location = req.query.location ? (req.query.location as string).split(',') : undefined;
  const category = req.query.category ? (req.query.category as string).split(',') : undefined;

  let shopService = new ShopService();

  let shops = await shopService.getShops({ category: category as any, location: location as any, order: order as any }, true);

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

router.post('/image/:shopId', upload.array('imgFile', 5), async (req, res, next) => {
  const shopId = req.params.shopId as string;
  if (!shopId || shopId.length === 0) return res.status(404).send();
  if (isValidObjectId(shopId) === false) return res.status(404).send();

  let shopController = new ShopController();

  const locations = (req.files as Express.MulterS3.File[]).map((file) => file.location);

  if (await shopController.addImage(shopId, locations)) {
    res.send({
      locations,
    });
  } else {
    res.send({
      error: 'Fail To Upload',
    });
  }
});

export default router;
