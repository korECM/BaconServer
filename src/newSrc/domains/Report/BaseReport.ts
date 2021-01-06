import {FoodingBaseEntity} from "../FoodingBaseEntity";
import {Column, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../User/User";

export enum ReportState {
    issued = 'issued',
    rejected = 'rejected',
    done = 'done',
}

export abstract class BaseReport extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: string;

    @Column('varchar', {length: 400, nullable: false})
    comment: string;
    @Column('varchar', {length: 15, default: ReportState.issued, nullable: false})
    reportState: ReportState;

    @ManyToOne(type => User, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    issuedBy: User;
}