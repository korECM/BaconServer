import jwt from 'jsonwebtoken';
import express from 'express';
import { UserInterface } from '../DB/models/User';

export function generateToken(user: UserInterface) {
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '7d',
      },
    );
    return token;
  }

