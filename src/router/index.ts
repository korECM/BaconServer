import { Request, Response, Application } from 'express';
import authRouter from './auth';
import shopRouter from './shop';
import reportRouter from './report';

export class Routes {
  public routes(app: Application): void {
    app.use('/auth', authRouter);
    app.use('/shop', shopRouter);
    app.use('/report', reportRouter);

    app.route('/').get((req: Request, res: Response) => {
      res.status(200).send({
        message: 'main routes1 Test2',
      });
    });
  }
}
