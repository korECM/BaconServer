import {IncomingWebhook} from "@slack/client";
import env from "../../env";
import {Notification, NotificationProvider} from "./NotificationProvider";

export class Slack implements NotificationProvider {
    private webhook = new IncomingWebhook(env.slack.webhookUrl);

    async send(message: string | Notification) {
        if (typeof message === "string") {
            await this.webhook.send(message);
        } else {
            await this.webhook.send({
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