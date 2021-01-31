import {Inject, Service} from "typedi";
import * as Sentry from "@sentry/node";
import {NotificationProvider} from "../infrastructures/notification/NotificationProvider";
import {Slack, SlackToken} from "../infrastructures/notification/Slack";
import env from "../env";

@Service()
export class NotificationService {

    constructor(@Inject(SlackToken) private notificationProvider: NotificationProvider<Slack.Channel>) {
    }

    async sendErrorMessage(error: Error) {
        try {
            await this.notificationProvider.send({
                color: 'danger',
                titleLink: env.sentry.issueUrl,
                title: "Fooding Server Error",
                text: "",
                fields: [{
                    title: error.message,
                    text: error.stack || "No Error Stack",
                }]
            }, Slack.Channel.FOODING_SERVER_ERROR)
        } catch (e) {
            Sentry.captureException(e);
        }
    }

    async sendMessage(message: string, channel: Slack.Channel) {
        try {
            await this.notificationProvider.send(message, channel)
        } catch (e) {
            Sentry.captureException(e);
        }
    }

}