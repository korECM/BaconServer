import env from "../env";

export class DateUtil {
    static dateForStringForDatabase(date: Date): string {
        if (env.isTest) {
            return date.toISOString().replace('T', ' ')
        } else {
            return date.toISOString()
        }
    }
}