import { UserTokenInterface } from '../lib/jwtMiddleware';

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenInterface;
    }
  }
}
