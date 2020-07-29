import { Request, Response, Application } from 'express';
import authRouter from './auth';

export class Routes {
  public routes(app: Application): void {
    app.use('/auth', authRouter);

    app.route('/').get((req: Request, res: Response) => {
      res.status(200).send({
        message: 'main routes1',
      });
    });
  }
}
