import {Column} from "typeorm";

export class BusinessHours {
    @Column()
    open: string;
    @Column()
    closed: string;

    constructor(open: string, closed: string) {
        this.open = open;
        this.closed = closed;
    }
}