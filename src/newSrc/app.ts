import express from "express";
import {Container, Inject, Service} from "typedi";
import env from "./env";
import schedule from 'node-schedule';
import {createDatabaseConnection} from "./database";
import {logger} from "./utils/logger";
import {NotificationService} from "./Services/NotificationService";
import {useMiddleware} from "./config/middlewareConfig";
import {Connection} from "typeorm";
import {MemoryDatabaseService, RedisServiceToken} from "./Services/RedisService";
import {DomainInitializationService} from "./Services/DomainInitializationService";

const apiURL: string = "/api/v1";

export {apiURL}

@Service()
export class App {

    public app: express.Application;
    public connection: Connection;
    private notificationService: NotificationService
    private domainInitializationService: DomainInitializationService;

    constructor(@Inject(RedisServiceToken) public redisService: MemoryDatabaseService) {
        this.app = express();
        this.redisService.connect();
        useMiddleware(this.app, this.redisService);
        this.errorHandling();
        this.schedule();
    }

    public async setDatabase() {
        try {
            logger.info("데이터베이스 연결 시도");
            this.connection = await createDatabaseConnection();
        } catch (e) {
            logger.error("데이터베이스 연결 실패 ", e);
        }
    }

    public async closeDatabase() {
        await this.connection.close();
        this.redisService.close();
    }

    public async initDomain() {
        this.domainInitializationService = Container.get(DomainInitializationService);
        await this.domainInitializationService.initAllDomain();
    }

    public createExpressServer(port: number) {
        this.app.listen(port, () => {
            logger.info(`Server Start at ${port}`);
        });
    }

    private schedule() {
        schedule.scheduleJob('0 0 * * *', () => {
            logger.info('scheduled updateESData');
            // updateESData();
        });
    }

    private errorHandling() {
        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            logger.warn(err.message);
            if (env.isProduction) {
                this.notificationService.sendErrorMessage(err);
            }

            res.status(500).end((res as any).sentry + "\n");
        })
    }
}