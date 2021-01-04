import env from "../env";
import redis from "redis";

const createRedisClient = () => {
    if (env.isProduction) {
        return redis.createClient(6379, env.db.redis);
    } else {
        if (env.isExecutedByNodeMon) {
            return redis.createClient(6379, 'localhost');
        } else {
            return redis.createClient(6379, 'host.docker.internal');
        }
    }
}

export {createRedisClient};