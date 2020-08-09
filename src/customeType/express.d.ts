import { UserTokenInterface } from '../lib/jwtMiddleware';
import 'jest-extended';
declare global {
  namespace Express {
    interface Request {
      user?: UserTokenInterface;
    }
  }
}
