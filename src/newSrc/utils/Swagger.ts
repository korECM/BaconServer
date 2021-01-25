import express from "express";
import swaggerUi from "swagger-ui-express";
import {getMetadataArgsStorage} from "routing-controllers";
import {routingControllersToSpec} from "routing-controllers-openapi";
import {validationMetadatasToSchemas} from "class-validator-jsonschema";
import {routingControllersOptions} from "../config/routingConfig";
import env from "../env";

/**
 * Swagger를 사용하도록 한다.
 * @param app Express Application
 */
export function useSwagger(app: express.Application) {
    // Parse class-validator classes into JSON Schema:
    const schemas = validationMetadatasToSchemas({
        refPointerPrefix: "#/components/schemas",
    });

    // Parse routing-controllers classes into OPENAPI spec:
    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
        components: {
            schemas,
        },
        info: {
            title: "Fooding Server",
            description: "Fooding API",
            version: "1.0.0",
        },
    });
    if (!env.isTest) {
        app.use(env.swagger.route, swaggerUi.serve, swaggerUi.setup(spec));
    }
}