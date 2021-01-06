import dotenv from "dotenv";

dotenv.config();

const env = {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === 'test',
    isExecutedByNodeMon: process.env.NODEMON_ENV === 'true',
    port: Number(process.env.PORT) || 8001,
    secret: {
        cookie: process.env.COOKIE_SECRET!,
        jwt: process.env.JWT_SECRET!
    },
    db: {
        mainDb: {
            host: process.env.DB_HOST!,
            username: process.env.DB_USERNAME!,
            password: process.env.DB_PASSWORD!,
            port: Number(process.env.DB_PORT) || 3306,
            databaseName: process.env.DB_NAME!,
            synchronize: process.env.DB_SYNCHRONIZE === "true",
            logging: (process.env.DB_LOGGING! as boolean | "all" | ("query" | "schema" | "error" | "warn" | "info" | "log" | "migration")[] | undefined),
        },
        redis: process.env.REDIS!
    },
    api: {
        aws: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            elasticsearch: process.env.ELASTICSEARCH!
        },
        kakao: {
            restApiKey: process.env.KAKAO_REST_API_KEY!
        }
    },
    swagger: {
        route: process.env.SWAGGER_ROUTE!
    },
    sentry: {
        dsn: process.env.SENTRY_DSN!,
        issueUrl: process.env.SENTRY_ISSUE_SITE!
    },
    slack: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL!
    }
}


export default env;