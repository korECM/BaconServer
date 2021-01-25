import {RoutingControllersOptions} from "routing-controllers";
import {apiURL} from "../app";
import {IndexController} from "../controllers/IndexController";
import {MainPostController} from "../controllers/MainPostController";
import {ShopController} from "../controllers/ShopController";
import {AuthController} from "../controllers/AuthController";
import {CustomErrorHandler} from "../middlewares/CustomErrorHandler";

const routingControllersOptions: RoutingControllersOptions = {
    cors: {
        origin: true,
        credentials: true,
    },
    routePrefix: apiURL,
    // controllers: [path.join(__dirname, "..", '/controllers/*.' + (env.isExecutedByNodeMon ? 'ts' : 'js'))],
    controllers: [IndexController, MainPostController, ShopController, AuthController],
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler]
}

export {routingControllersOptions};