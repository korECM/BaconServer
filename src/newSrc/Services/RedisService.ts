import {Service, Token} from "typedi";
import redis from "redis";
import {logger} from "../utils/logger";
import env from "../env";

export interface MemoryDatabaseService {

    connect(): void;

    close(): void;

    get(key: string): Promise<string | null>;

    set(key: string, value: string, mode: string, duration: number): Promise<boolean>;

    isRealRedis(): boolean;

    getRedisClient(): redis.RedisClient;
}

export const RedisServiceToken = new Token<MemoryDatabaseService>();

@Service(RedisServiceToken)
export class RedisService implements MemoryDatabaseService {

    private client: redis.RedisClient;

    public connect() {
        if (env.isProduction) {
            this.client = redis.createClient(6379, env.db.redis);
        } else if (env.isExecutedByNodeMon)
            this.client = redis.createClient(6379, 'localhost');
    }

    public close() {
        this.client.unref();
    }

    public async get(key: string) {
        return new Promise<string | null>((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                if (err) {
                    logger.warn(err);
                    resolve(null);
                }
                resolve(reply);
            })
        })
    }

    public async set(key: string, value: string, mode: string, duration: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.set(key, value, mode, duration, (err, reply) => {
                if (err) {
                    logger.warn(err);
                    resolve(false);
                }
                resolve(true);
            })
        })
    }

    public isRealRedis(): boolean {
        return true;
    }

    public getRedisClient(): redis.RedisClient {
        return this.client;
    }

}