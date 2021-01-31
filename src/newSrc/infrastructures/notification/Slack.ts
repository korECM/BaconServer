import {IncomingWebhook} from "@slack/client";
import env from "../../env";
import {Notification, NotificationProvider} from "./NotificationProvider";
import {Service, Token} from "typedi";

export const SlackToken = new Token<Slack>();

@Service(SlackToken)
export class Slack implements NotificationProvider<Slack.Channel> {
    private webhook = new IncomingWebhook(env.slack.webhookUrl);

    async send(message: string | Notification, channel: Slack.Channel) {
        if (typeof message === "string") {
            await this.webhook.send(message);
        } else {
            await this.webhook.send({
                channel: channel || undefined,
                attachments: [
                    {
                        color: message.color || "default",
                        title: message.title,
                        title_link: message.titleLink,
                        text: message.text,
                        fields: !message.fields ? [] : message.fields.map(field => ({
                            title: field.title,
                            value: field.text,
                            short: false,
                        })),
                        ts: `${new Date().getTime()}`
                    }
                ]
            });
        }
    }
}

export namespace Slack {
    export enum Channel {
        FOODING_SERVER_ERROR = '#alert_fooding_server_error',
        FOODING_SIGNUP = '#alert_fooding_signup',
        FOODING_REVIEW = '#alert_fooding_review',
        FOODING_REPORT = '#alert_fooding_report'
    }
}