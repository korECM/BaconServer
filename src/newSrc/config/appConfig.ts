import session from "express-session";
import env from "../env";
import connectRedis from "connect-redis";
import {MemoryDatabaseService} from "../Services/RedisService";

const sessionOptions = (redis: MemoryDatabaseService): session.SessionOptions => {
    const sessionOptions: session.SessionOptions = {
        resave: false,
        saveUninitialized: false,
        secret: env.secret.cookie,
        cookie: {
            httpOnly: true,
            secure: env.isProduction,
        },
        proxy: env.isProduction,
    }
    
    if (redis.isRealRedis()) {
        const RedisStore = connectRedis(session);
        return {
            ...sessionOptions,
            store: new RedisStore({client: redis.getRedisClient()}),
        }
    }
    return sessionOptions;
}

export {sessionOptions}