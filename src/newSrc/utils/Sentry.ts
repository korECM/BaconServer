import express from "express";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import env from "../env";

export function useSentry() {
    return {
        request : function(app : express.Application) {
            Sentry.init({
                dsn: env.sentry.dsn,
                integrations: [
                    // enable HTTP calls tracing
                    new Sentry.Integrations.Http({tracing: true}),
                    // enable Express.js middleware tracing
                    new Tracing.Integrations.Express({app}),
                    new Tracing.Integrations.Mysql(),
                ],
                tracesSampleRate : 0.5
            });

            app.use(Sentry.Handlers.requestHandler());
            app.use(Sentry.Handlers.tracingHandler());
        },
        error : function(app : express.Application) {
            app.use(Sentry.Handlers.errorHandler());
        }
    }
}