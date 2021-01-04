import {RoutingControllersOptions} from "routing-controllers";
import env from "../env";
import {logger} from "../utils/logger";
import path from "path";


const routingControllersOptions : RoutingControllersOptions = {
    cors : {
        origin: true,
        credentials: true,
    },
    routePrefix : "/api/v1",
    controllers: [path.join(__dirname, "..", '/controllers/*.' + (env.isExecutedByNodeMon ? 'ts' : 'js'))],
}

export {routingControllersOptions};