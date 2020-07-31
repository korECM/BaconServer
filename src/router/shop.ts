import express from 'express';
import Joi from 'joi';
import { isInvalid } from './validate';
import { ShopService, ShopOrder } from '../service/ShopService';
import { Location } from '../DB/models/Shop';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { order } = req.query;
  const location = req.query.location ? (req.query.location as string).split(',') : undefined;
  const category = req.query.category ? (req.query.category as string).split(',') : undefined;

  let shopService = new ShopService();

  let shops = await shopService.getShops({ category: category as any, location: location as any, order: order as any });

  res.status(200).json(shops);
});

export default router;
