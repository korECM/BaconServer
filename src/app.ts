import express from 'express';
import session from 'express-session';
import { Routes } from './router';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import hpp from 'hpp';
import { MyError } from './types';
import { jwtMiddleware } from './lib/jwtMiddleware';
import cors from 'cors';
import redis from 'redis';
import connectRedis from 'connect-redis';
import { updateESData } from './lib/updateESData';
import schedule from 'node-schedule';
import env from "./newSrc/env";
const RedisStore = connectRedis(session);

class App {
  public app: express.Application;
  public routes: Routes = new Routes();
  public redisClient: redis.RedisClient;

  constructor() {
    this.app = express();
    if (env.isProduction) {
      this.redisClient = redis.createClient(6379, env.db.redis);
    } else {
      if (env.isExecutedByNodeMon) {
        this.redisClient = redis.createClient(6379, 'localhost');
      } else {
        this.redisClient = redis.createClient(6379, 'host.docker.internal');
      }
    }
    this.config();
    this.routes.routes(this.app);
    this.errorHandler();
    this.schedule();
  }

  private schedule() {
    schedule.scheduleJob('0 0 * * *', () => {
      console.log('scheduled updateESData');
      updateESData();
    });
  }

  private config() {
    this.app.set('port', process.env.PORT || 8001);

    if (!env.isTest) {
      if (env.isProduction) {
        this.app.use(morgan('combined'));
        this.app.use(helmet());
        this.app.use(hpp());
      } else {
        this.app.use(morgan('dev'));
      }
    }

    this.app.use(
      cors({
        origin: true,
        credentials: true,
      }),
    );

    this.app.use(express.static(path.join(__dirname, 'public')));

    this.app.use(express.json());
    this.app.use(
      express.urlencoded({
        extended: false,
      }),
    );

    this.app.use(cookieParser(process.env.COOKIE_SECRET));

    const sessionOption: session.SessionOptions = {
      resave: false,
      saveUninitialized: false,
      secret: env.secret.cookie,
      cookie: {
        httpOnly: true,
        secure: false,
      },
      store: new RedisStore({ client: this.redisClient }),
    };
    if (env.isProduction) {
      // sessionOption.proxy = true;
      // sessionOption.cookie!.secure = true;
    }

    this.app.use(session(sessionOption));

    this.app.use(jwtMiddleware);
  }
  private errorHandler(): void {
    this.app.use((req, res, next) => {
      const err = new MyError(404);
      next(err);
    });

    this.app.use((err: MyError, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err);
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      res.status(err.status || 500);
      return res.status(err.status || 500).send(err.message);
    });
  }
}

const appContainer = new App();
const app = appContainer.app;

export { app, appContainer };
