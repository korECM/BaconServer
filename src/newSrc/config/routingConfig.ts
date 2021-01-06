import {RoutingControllersOptions} from "routing-controllers";
import env from "../env";
import path from "path";
import {apiURL} from "../app";

const routingControllersOptions: RoutingControllersOptions = {
    cors: {
        origin: true,
        credentials: true,
    },
    routePrefix: apiURL,
    controllers: [path.join(__dirname, "..", '/controllers/*.' + (env.isExecutedByNodeMon ? 'ts' : 'js'))],
}

export {routingControllersOptions};