import session from "express-session";
import env from "../env";
import connectRedis from "connect-redis";
import redis from 'redis';

const RedisStore = connectRedis(session);

const sessionOptions = (redis: redis.RedisClient): session.SessionOptions => {
    return {
        resave: false,
        saveUninitialized: false,
        secret: env.secret.cookie,
        cookie: {
            httpOnly: true,
            secure: env.isProduction,
        },
        proxy: env.isProduction,
        store: new RedisStore({client: redis}),
    };
}

export {sessionOptions}