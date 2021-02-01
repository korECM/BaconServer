import {Connection, ConnectionOptions, createConnection, useContainer} from "typeorm";
import env from "./env";
import {Container} from "typedi";

export async function createDatabaseConnection() {
    try {
        const connectionOptions: ConnectionOptions = {
            type: "mariadb",
            host: env.db.mainDb.host,
            port: env.db.mainDb.port,
            username: env.db.mainDb.username,
            password: env.db.mainDb.password,
            database: env.db.mainDb.databaseName,
            entities: [
                __dirname + "/domains/**/*.{ts,js}",
            ],
            logging: env.db.mainDb.logging,
            synchronize: env.db.mainDb.synchronize,
            charset: env.db.mainDb.charset,
            timezone: "+09:00"
        }

        useContainer(Container);
        let connection: Connection = await createConnection(connectionOptions);
        console.log("DB Connected");
        return connection;
    } catch (error) {
        throw error;
    }
}