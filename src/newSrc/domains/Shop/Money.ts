import {Column} from "typeorm";

export class Money {
    @Column({name: "price", nullable: false})
    price: number;
}