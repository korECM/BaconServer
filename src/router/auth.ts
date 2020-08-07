import express from 'express';
import Joi from 'joi';
import axios from 'axios';
import { UserService } from '../service/UserService';
import { isInvalid } from './validate';
import { generateToken } from '../lib/jwtMiddleware';
import { UserController } from '../DB/controller/User/UserController';

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
  const user = await userService.signUp(req.body, true);

  if (!user) return res.status(409).send();

  let token = generateToken(user);

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

  let token = generateToken(user);

  res.cookie('access_token', token, {
    maxAge: ONE_DAY * 7,
    httpOnly: true,
  });

  res.status(200).send();
});

const kakaoCallback = 'http://localhost:3000/auth/kakao/callback';

router.get('/signIn/kakao', async (req, res, next) => {
  // 사용자 동의 화면으로 리다이렉트
  res.redirect(`https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${kakaoCallback}&response_type=code`);
});

router.get('/signIn/kakao/callback', async (req, res, next) => {
  const { code } = req.query;
  // 얻은 코드를 바탕으로 access_token 얻기
  const tokenRequestURL = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${kakaoCallback}&code=${code}`;
  try {
    const response = await axios.get(tokenRequestURL);
    const { access_token, error } = response.data;
    if (error) {
      console.error(error);
      return res.status(500).send();
    }

    const profileRequestURL = 'https://kapi.kakao.com/v2/user/me';

    const profileResponse = await axios.get(profileRequestURL, { headers: { Authorization: `Bearer ${access_token}` } });

    const { id, gender } = profileResponse.data;

    const userController = new UserController();

    let user = await userController.getKakaoUserExist(id);

    if (user === null) {
      const userService = new UserService();
      user = await userService.signUp(
        {
          name: '설정 전 이름',
          provider: 'kakao',
          email: 'none',
          password: 'none',
          snsId: id,
        },
        false,
      );
      return res.status(206).json({
        id: user?._id,
        status: 303,
      });
    }

    if (!user) return res.status(409).send();

    if (user.kakaoNameSet === false) {
      return res.status(206).json({
        id: user?._id,
        status: 303,
      });
    }

    let token = generateToken(user);

    res.cookie('access_token', token, {
      maxAge: ONE_DAY * 7,
      httpOnly: true,
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }

  res.send();
});

router.post('/kakao/name', async (req, res, next) => {
  const name = req.body.name as string;
  const id = req.body.id as string;
  if (!name || name.length === 0) return res.status(400).send();

  const userController = new UserController();

  let user = await userController.setName(id, name);
  if (!user) return res.status(409).send();

  let token = generateToken(user);

  res.cookie('access_token', token, {
    maxAge: ONE_DAY * 7,
    httpOnly: true,
  });

  res.status(200).send();
});

router.get('/check', async (req, res, next) => {
  const user = req.user;
  // 로그인 안했다면
  if (!user) {
    return res.status(401).send();
  }
  return res.status(200).send(user);
});

router.get('/logout', (req, res, next) => {
  res.clearCookie('access_token');
  res.status(204).send();
});

export default router;
