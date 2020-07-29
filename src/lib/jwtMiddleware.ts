import jwt from 'jsonwebtoken';
import express from 'express';
import { UserInterface } from '../DB/models/User';

export interface UserTokenInterface {
  _id: string;
  name: string;
  email: string;
}

export function generateToken(user: UserInterface) {
  const userToken: UserTokenInterface = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  const token = jwt.sign(userToken, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
  return token;
}

export function jwtMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies.access_token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserTokenInterface;
    req.user = {
      _id: decoded._id,
      name: decoded.name,
      email: decoded.email,
    };
    return next();
  } catch (error) {
    return next();
  }
}
