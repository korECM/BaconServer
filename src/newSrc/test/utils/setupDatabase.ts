import {Container} from "typedi";
import {createConnection, useContainer} from "typeorm";

export async function createMemoryDatabase() {
    useContainer(Container);
    return createConnection({
        type: "better-sqlite3",
        database: ":memory:",
        entities: [__dirname + "/../../domains/**/*{.ts,.js}"],
        dropSchema: true,
        synchronize: true,
        logging: false,
    });
}