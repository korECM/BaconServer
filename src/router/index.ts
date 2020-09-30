import { Request, Response, Application } from 'express';
import authRouter from './auth';
import shopRouter from './shop';
import reportRouter from './report';
import { MainPostController } from '../DB/controller/MainPostController';

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

    app.route('/mainPost').get(async (req, res) => {
      let PostController = new MainPostController();
      let posts = await PostController.getMainPosts();
      res.status(200).send(posts);
    });
  }
}
