import {ExpressErrorMiddlewareInterface, HttpError, Middleware} from "routing-controllers";
import {ValidationError} from "class-validator";
import express from "express";
import env from "../env";

/**
 * Express middleware to catch all errors throwed in controlers.
 * Should be first in error chain as it sends response to client.
 *
 * @export
 * @class CustomErrorHandler
 * @implements {ExpressErrorMiddlewareInterface}
 */
@Middleware({type: 'after'})
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {

    /**
     * Error handler - sets response code and sends json with error message.
     * Handle: standard node error, HttpError, ValidationError and string.
     *
     * @param {any} error An throwed object (error)
     * @param {express.Request} req The Express request object
     * @param {express.Response} res The Express response object
     * @param {express.NextFunction} next The next Express middleware function
     */
    public error(error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) {
        let responseObject = {} as any;

        // if its an array of ValidationError
        if (error.errors && Array.isArray(error.errors) && error.errors.every((element: any) => element instanceof ValidationError)) {
            res.status(400);
            responseObject.message = "Invalid Request";
            if (env.isDevelopment || env.isTest) {
                console.log(error)
                responseObject.errors = error;
            }
        } else {
            // set http status
            if (error instanceof HttpError && error.httpCode) {
                res.status(error.httpCode);
            } else {
                res.status(500);
            }

            if (error instanceof Error) {
                // set response error fields
                if (error.name && (env.isDevelopment || error.message)) { // show name only if in development mode and if error message exist too
                    responseObject.name = error.name;
                }
                if (error.message) {
                    responseObject.message = error.message;
                }
                if (error.stack && env.isDevelopment) {
                    responseObject.stack = error.stack;
                }
            } else if (typeof error === "string") {
                responseObject.message = error;
            }
        }

        // send json only with error
        res.json(responseObject);
    }
}