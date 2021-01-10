import "reflect-metadata";
import {logger} from "./utils/logger";
import {App} from "./app";
import env from "./env";
import {Container} from "typedi";

let app: App;

try {
    // const app = new App();
    app = Container.get(App);

    (async () => {
        await app.setDatabase();
        await app.initDomain();
        if (!env.isTest) {
            app.createExpressServer(env.port);
        }
    })()

} catch (error) {
    logger.error("createExpressServer Error ", error);
    throw error;
}

export default app.app;