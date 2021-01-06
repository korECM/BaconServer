import express from 'express';
import env from '../env';
import morgan from 'morgan';
import helmet from 'helmet';
import hpp from 'hpp';
import redis from 'redis';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import {sessionOptions} from './appConfig';
import {jwtMiddleware} from '../../lib/jwtMiddleware';
import {useSentry} from '../utils/Sentry';
import {useContainer as useRoutingContainer} from 'routing-controllers/container';
import Container from 'typedi';
import {useExpressServer} from 'routing-controllers';
import {routingControllersOptions} from './routingConfig';
import {useSwagger} from '../utils/Swagger';
import {useContainer as useValidationContainer} from "class-validator"

export function useMiddleware(app: express.Application, redis: redis.RedisClient) {
    app.set('port', env.port || 8001);

    if (!env.isTest) {
        if (env.isProduction) {
            app.use(morgan('combined'), helmet(), hpp());
        } else {
            app.use(morgan('dev'));
        }
    }

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(express.json());
    app.use(
        express.urlencoded({
            extended: false,
        }),
    );

    app.use(cookieParser(env.secret.cookie));
    app.use(session(sessionOptions(redis)));

    app.use(jwtMiddleware);

    useSentry().request(app);
    useRoutingContainer(Container);
    useValidationContainer(Container);
    useExpressServer(app, routingControllersOptions);
    useSwagger(app);
    useSentry().error(app);
}
