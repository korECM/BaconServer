import {MemoryDatabaseService} from "../../Services/RedisService";
import {RedisClient} from "redis";


export class MockRedisService implements MemoryDatabaseService {

    private db: { [key: string]: string; } = {}

    connect(): void {
        this.db = {};
    }

    close(): void {
    }

    get(key: string): Promise<string | null> {
        return Promise.resolve(this.db[key]);
    }

    getRedisClient(): RedisClient {
        throw new Error("This is mock redis!!");
    }

    isRealRedis(): boolean {
        return false;
    }

    set(key: string, value: string, mode: string, duration: number): Promise<boolean> {
        this.db[key] = value;
        return Promise.resolve(true);
    }

}