import express from 'express';
import Joi from 'joi';
import { ReviewController } from '../DB/controller/Review/ReviewController';
import { ShopController } from '../DB/controller/Shop/ShopController';
import { isLogin, isAdmin } from '../lib/userMiddleware';
import { isValidObjectId } from 'mongoose';
import { reqValidate } from '../lib/JoiValidate';

const router = express.Router();

router.get('/my', isLogin, async (req, res, next) => {
  let shopController = new ShopController();
  try {
    let reports = await shopController.getMyReport(req.user!._id);
    return res.status(200).send(reports);
  } catch (error) {
    return res.status(406).send();
  }
});

router.get('/shop', isAdmin, async (req, res, next) => {
  let shopController = new ShopController();
  try {
    let reports = await shopController.getShopReport();
    return res.status(200).send(reports);
  } catch (error) {
    return res.status(406).send();
  }
});

router.get('/image', isAdmin, async (req, res, next) => {
  let shopController = new ShopController();
  try {
    let reports = await shopController.getImageReport();
    return res.status(200).send(reports);
  } catch (error) {
    return res.status(406).send();
  }
});

router.get('/review', isAdmin, async (req, res, next) => {
  let reviewController = new ReviewController();
  try {
    let reports = await reviewController.getReviewReport();
    return res.status(200).send(reports);
  } catch (error) {
    return res.status(406).send();
  }
});

router.put(
  '/shop/:reportId',
  isAdmin,
  reqValidate(
    Joi.object({
      state: Joi.string(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const reportId = req.params.reportId as string;
    if (isValidObjectId(reportId) === false) return res.status(400).send();

    let state = req.body.state as string;

    let shopController = new ShopController();

    try {
      if (shopController.setShopReportMode(reportId, state)) {
        return res.status(201).send({
          message: 'success',
        });
      } else {
        return res.status(406).send();
      }
    } catch (error) {
      console.error(error);
      return res.status(406).send();
    }
  },
);

router.put(
  '/review/:reportId',
  isAdmin,
  reqValidate(
    Joi.object({
      state: Joi.string(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const reportId = req.params.reportId as string;
    if (isValidObjectId(reportId) === false) return res.status(400).send();

    let state = req.body.state as string;

    let reviewController = new ReviewController();

    try {
      if (reviewController.setReportState(reportId, state)) {
        return res.status(201).send({
          message: 'success',
        });
      } else {
        return res.status(406).send();
      }
    } catch (error) {
      console.error(error);
      return res.status(406).send();
    }
  },
);

router.put(
  '/image/:reportId',
  isAdmin,
  reqValidate(
    Joi.object({
      state: Joi.string(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const reportId = req.params.reportId as string;
    if (isValidObjectId(reportId) === false) return res.status(400).send();

    let state = req.body.state as string;

    let shopController = new ShopController();

    try {
      if (shopController.setImageReportMode(reportId, state)) {
        return res.status(201).send({
          message: 'success',
        });
      } else {
        return res.status(406).send();
      }
    } catch (error) {
      console.error(error);
      return res.status(406).send();
    }
  },
);

router.post(
  '/shop/:shopId',
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
      return res.status(201).send({
        message: 'success',
      });
    } else {
      return res.status(406).send();
    }
  },
);

router.post(
  '/review/:reviewId',
  isLogin,
  reqValidate(
    Joi.object({
      comment: Joi.string().required().max(200),
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
      return res.status(201).send({
        message: 'success',
      });
    } else {
      return res.status(406).send();
    }
  },
);

router.post('/image/:imageId', isLogin, async (req, res, next) => {
  const imageId = req.params.imageId as string;
  if (isValidObjectId(imageId) === false) return res.status(400).send();

  let shopController = new ShopController();
  if (await shopController.addImageReport(imageId, req.user!._id)) {
    return res.status(201).send({
      message: 'success',
    });
  } else {
    return res.status(406).send();
  }
});

export default router;
