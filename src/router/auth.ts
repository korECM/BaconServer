import express from 'express';
import Joi from 'joi';
import axios from 'axios';
import { UserService } from '../service/UserService';
import { isInvalid } from './validate';
import { generateToken } from '../lib/jwtMiddleware';
import { UserController } from '../DB/controller/User/UserController';
import { isNotLogin, isLogin } from '../lib/userMiddleware';
import { reqValidate } from '../lib/JoiValidate';
import { UserInterface } from '../DB/models/User';

const ONE_DAY = 1000 * 60 * 60 * 24;

const router = express.Router();

const userToToken = (res: express.Response, user: UserInterface, status: number) => {
  let token = generateToken(user);

  res.cookie('access_token', token, {
    maxAge: ONE_DAY * 7,
    httpOnly: true,
  });

  res.status(status).send({
    message: 'success',
  });
};

router.post(
  '/signUp',
  isNotLogin,
  reqValidate(
    Joi.object({
      name: Joi.string(),
      email: Joi.string().email(),
      password: Joi.string().optional(),
      snsId: Joi.optional(),
      provider: Joi.string().valid(...['local', 'kakao']),
    }),
    'body',
  ),
  async (req, res, next) => {
    const userService = new UserService();
    const user = await userService.signUp(req.body, true);

    if (!user) return res.status(409).send();

    return userToToken(res, user, 201);
  },
);

router.post(
  '/signIn',
  isNotLogin,
  reqValidate(
    Joi.object({
      email: Joi.string().email(),
      password: Joi.string(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const userService = new UserService();
    const user = await userService.signIn(req.body);

    if (!user) return res.status(409).send();

    return userToToken(res, user, 200);
  },
);

const kakaoCallback = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/auth/kakao/callback' : 'http://221.149.10.240:5000/auth/kakao/callback';

router.get('/signIn/kakao', async (req, res, next) => {
  // 사용자 동의 화면으로 리다이렉트
  res.redirect(`https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${kakaoCallback}&response_type=code`);
});

router.get('/signIn/kakao/callback', isNotLogin, async (req, res, next) => {
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

    // 가입한 카카오 계정이 존재하지 않는 경우
    if (user === null) {
      const userService = new UserService();
      // 일단 이름이 설정되지 않은 카카오 계정을 하나 만든다
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
      // 해당 카카오 계정의 닉네임을 프론트로부터 받기 위해서
      // 계정의 id를 보낸다
      return res.status(206).json({
        id: user?._id,
        status: 303,
      });
    }

    // 만약 가입한 카카오 계정이 존재하고 로그인 안한 상태라면
    if (user.kakaoNameSet === false) {
      // 닉네임 입력 받는 페이지로 리다이렉션 신호를 프론트에게 보낸다
      return res.status(206).json({
        id: user?._id,
        status: 303,
      });
    }

    return userToToken(res, user, 200);
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

// 카카오 계정의 닉네임을 설정하는 라우터
router.post(
  '/kakao/name',
  isNotLogin,
  reqValidate(
    Joi.object({
      id: Joi.string().required(),
      // TODO: 이름 글자수 제한 필요
      name: Joi.string().required(),
    }),
    'body',
  ),
  async (req, res, next) => {
    const name = req.body.name as string;
    const id = req.body.id as string;

    const userController = new UserController();

    let user = await userController.setName(id, name);
    if (!user) return res.status(409).send();

    return userToToken(res, user, 200);
  },
);

router.get('/check', isLogin, async (req, res, next) => {
  const user = req.user;
  return res.status(200).send(user);
});

router.get('/logout', isLogin, (req, res, next) => {
  res.clearCookie('access_token');
  res.status(204).send();
});

export default router;
