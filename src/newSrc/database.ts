import {ConnectionOptions, createConnection, useContainer} from "typeorm";
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
            entities: [__dirname + "/entity/*.ts"],
            synchronize: env.db.mainDb.synchronize,
        }

        useContainer(Container);
        await createConnection(connectionOptions);
        console.log("DB Connected");
    } catch (error) {
        throw error;
    }
}