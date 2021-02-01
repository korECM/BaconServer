import {Column} from "typeorm";
import {Min} from "class-validator";

export class Keyword {
    @Column({nullable: false, default: 0})
    @Min(0)
    costRatio: number;
    @Column({nullable: false, default: 0})
    @Min(0)
    atmosphere: number;
    @Column({nullable: false, default: 0})
    @Min(0)
    group: number;
    @Column({nullable: false, default: 0})
    @Min(0)
    individual: number;
    @Column({nullable: false, default: 0})
    @Min(0)
    riceAppointment: number;

    constructor(costRatio: number, atmosphere: number, group: number, individual: number, riceAppointment: number) {
        this.costRatio = costRatio;
        this.atmosphere = atmosphere;
        this.group = group;
        this.individual = individual;
        this.riceAppointment = riceAppointment;
    }
}