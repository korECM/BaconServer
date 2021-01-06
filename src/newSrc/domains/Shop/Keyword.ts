import {Column} from "typeorm";

export class Keyword {
    @Column({nullable: false, default: 0})
    costRatio: number;
    @Column({nullable: false, default: 0})
    atmosphere: number;
    @Column({nullable: false, default: 0})
    group: number;
    @Column({nullable: false, default: 0})
    individual: number;
    @Column({nullable: false, default: 0})
    riceAppointment: number;
}