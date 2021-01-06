import {Column} from "typeorm";

export class BusinessHours {
    @Column()
    open: string;
    @Column()
    closed: string;
}