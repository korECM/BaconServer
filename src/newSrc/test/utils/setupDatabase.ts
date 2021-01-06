import {Container} from "typedi";
import {createConnection, useContainer} from "typeorm";

export async function createMemoryDatabase() {
    useContainer(Container);
    return createConnection({
        type: "sqlite",
        database: ":memory:",
        entities: [__dirname + "/../../domains/**/*{.ts,.js}"],
        dropSchema: true,
        synchronize: true,
        logging: false,
    });
}