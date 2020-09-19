import jwt from 'jsonwebtoken';
import express from 'express';
import { UserInterface } from '../DB/models/User';
import { UserController } from '../DB/controller/User/UserController';

interface DecodedTokenInterface extends UserTokenInterface {
  exp: number;
}

export interface UserTokenInterface {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export function generateToken(user: UserInterface) {
  const userToken: UserTokenInterface = {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  const token = jwt.sign(userToken, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
  return token;
}

const ONE_DAY = 70 * 60 * 24;

export async function jwtMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  let token = req.cookies.access_token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedTokenInterface;
    req.user = {
      _id: decoded._id,
      name: decoded.name,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < ONE_DAY * 3.5) {
      const userController = new UserController();
      let user = (await userController.findById(decoded._id)) as UserInterface;
      if (!user) return next();

      token = generateToken(user);

      res.cookie('access_token', token, {
        maxAge: ONE_DAY * 7,
        httpOnly: true,
      });
    }
    return next();
  } catch (error) {
    return next();
  }
}

export const userToToken = (res: express.Response, user: UserInterface, status: number) => {
  let token = generateToken(user);

  res.cookie('access_token', token, {
    maxAge: ONE_DAY * 7,
    httpOnly: true,
  });

  res.status(status).send({
    message: 'success',
  });
};
