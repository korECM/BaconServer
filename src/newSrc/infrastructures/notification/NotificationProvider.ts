export interface NotificationProvider {
    send(message: string | Notification): Promise<void>;
}

export interface Notification {
    color?: string;
    title : string;
    text : string;
    titleLink? : string;
    fields? : Notification[];
}
