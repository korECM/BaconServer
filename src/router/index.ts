import { Request, Response, Application } from 'express';
import { appContainer } from '../index';
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
      appContainer.redisClient.get('mainPost', async (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send([]);
          return;
        }
        if (data) {
          res.status(200).send(JSON.parse(data));
        } else {
          let PostController = new MainPostController();
          let posts = await PostController.getMainPosts();

          appContainer.redisClient.set('mainPost', JSON.stringify(posts), 'EX', 60 * 60);

          res.status(200).json(posts);
        }
      });
    });
  }
}
