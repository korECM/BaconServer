export interface NotificationProvider<T> {
    send(message: string | Notification, channel: T): Promise<void>;
}

export interface Notification {
    color?: string;
    title: string;
    text: string;
    titleLink?: string;
    fields?: Notification[];
}
