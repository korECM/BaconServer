import express from 'express';
import Joi from 'joi';
import { UserService } from '../service/UserService';
import { isInvalid } from './validate';

const ONE_DAY = 1000 * 60 * 60 * 24;

const router = express.Router();

router.post('/signUp', async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().optional(),
    snsId: Joi.optional(),
    provider: Joi.string().valid(...['local', 'kakao']),
  });

  if (isInvalid(req.body, schema)) {
    return res.status(400).send();
  }

  const userService = new UserService();
  const user = await userService.signUp(req.body);

  if (!user) return res.status(409).send();

  let token = userService.generateToken(user);

  res.cookie('access_token', token, {
    maxAge: ONE_DAY * 7,
    httpOnly: true,
  });

  res.status(201).send({
    message: 'success',
  });
});

router.post('/signIn', async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string(),
  });

  if (isInvalid(req.body, schema)) {
    return res.status(400).send();
  }

  const userService = new UserService();
  const user = await userService.signIn(req.body);

  if (!user) return res.status(409).send();

  let token = userService.generateToken(user);

  res.cookie('access_token', token, {
    maxAge: ONE_DAY * 7,
    httpOnly: true,
  });

  res.status(200).send(user);
});

export default router;
