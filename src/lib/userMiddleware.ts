import express from 'express';

export function isLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.user) {
    next();
  } else {
    return res.status(401).send();
  }
}

export function isNotLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.user) {
    next();
  } else {
    return res.status(403).send();
  }
}
